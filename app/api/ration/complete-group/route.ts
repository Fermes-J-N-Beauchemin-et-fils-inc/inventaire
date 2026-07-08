import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, group_key, consumed } = body;

        if (!id || !group_key) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const pushedRation = await prisma.pushedRation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pushedRation) {
            return NextResponse.json({ error: "Ration not found" }, { status: 404 });
        }

        const completedKeys = Array.isArray(pushedRation.completed_keys) 
            ? [...pushedRation.completed_keys] 
            : [];

        if (completedKeys.includes(group_key)) {
            return NextResponse.json({ success: true, message: "Already completed" });
        }

        completedKeys.push(group_key);
        const newGroupsDone = completedKeys.length;
        const newStatus = newGroupsDone >= pushedRation.groups_total ? "TERMINEE" : "EN_COURS";

        // Handle inventory deduction and status update in a transaction
        const updated = await prisma.$transaction(async (tx) => {
            const updatedRation = await tx.pushedRation.update({
                where: { id: parseInt(id) },
                data: {
                    completed_keys: completedKeys,
                    groups_done: newGroupsDone,
                    status: newStatus
                }
            });

            // Deduct inventory and log transactions
            if (consumed && Array.isArray(consumed)) {
                for (const item of consumed) {
                    if (!item.food_id || isNaN(item.consumed_tqs)) continue;
                    
                    const foodId = parseInt(item.food_id);
                    const quantityInKg = parseFloat(item.consumed_tqs);
                    if (quantityInKg <= 0) continue;

                    const food = await tx.food.findUnique({
                        where: { id: foodId },
                        include: { unit_type: true }
                    });
                    let rationToKg = food?.unit_type?.ration_to_kg || 1;
                    if (rationToKg === 1 && food?.unit_type?.name?.toLowerCase() === 'tm') {
                        rationToKg = 1000;
                    }
                    const quantity = quantityInKg / rationToKg; // Convert kg to stored units

                    // Update stock from the storage that has the most stock
                    const bestStorage = await tx.foodStorage.findFirst({
                        where: { food_id: foodId, current_stock: { gt: 0 } },
                        orderBy: { current_stock: 'desc' }
                    });

                    let storageIdToLog = null;

                    if (bestStorage) {
                        storageIdToLog = bestStorage.storage_id;
                        await tx.foodStorage.update({
                            where: { food_id_storage_id: { food_id: foodId, storage_id: bestStorage.storage_id } },
                            data: { current_stock: { decrement: quantity } }
                        });
                    }

                    const cost = (quantityInKg / 1000) * (food?.price_per_tqs || 0);

                    // Log transaction with pushed_ration_id
                    await tx.stockTransaction.create({
                        data: {
                            food_id: foodId,
                            storage_id: storageIdToLog,
                            pushed_ration_id: parseInt(id),
                            quantity: -quantity,
                            transaction_type: "CONSUMPTION",
                            financial_cost: cost
                        }
                    });

                    // Log financial transaction for this food in this group
                    if (cost > 0) {
                        await tx.financialTransaction.create({
                            data: {
                                date: new Date(),
                                type: "OUT",
                                category: "Alimentation",
                                amount: cost,
                                pushed_ration_id: parseInt(id),
                                description: `Coût alimentation: ${food?.name} (Groupe ${group_key})`,
                            }
                        });
                    }
                }
            }
            
            return updatedRation;
        });

        return NextResponse.json({ success: true, pushedRation: updated });
    } catch (error) {
        console.error("Error completing group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
