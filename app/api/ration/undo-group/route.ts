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

        if (!completedKeys.includes(group_key)) {
            return NextResponse.json({ success: true, message: "Not completed" });
        }

        const updatedKeys = completedKeys.filter(k => k !== group_key);
        const newGroupsDone = updatedKeys.length;
        const newStatus = "EN_COURS"; // Since we are undoing, it can never be TERMINEE anymore

        // Handle inventory restoration in a transaction
        const updated = await prisma.$transaction(async (tx) => {
            const updatedRation = await tx.pushedRation.update({
                where: { id: parseInt(id) },
                data: {
                    completed_keys: updatedKeys,
                    groups_done: newGroupsDone,
                    status: newStatus
                }
            });

            // Restore inventory and log adjustment transactions
            if (consumed && Array.isArray(consumed)) {
                for (const item of consumed) {
                    if (!item.food_id || isNaN(item.consumed_tqs)) continue;
                    
                    const foodId = parseInt(item.food_id);
                    const quantityInKg = parseFloat(item.consumed_tqs); // This is positive
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

                    // Update stock to the storage that has the most stock
                    const bestStorage = await tx.foodStorage.findFirst({
                        where: { food_id: foodId },
                        orderBy: { current_stock: 'desc' }
                    });

                    let storageIdToLog = null;

                    if (bestStorage) {
                        storageIdToLog = bestStorage.storage_id;
                        await tx.foodStorage.update({
                            where: { food_id_storage_id: { food_id: foodId, storage_id: bestStorage.storage_id } },
                            data: { current_stock: { increment: quantity } }
                        });
                    }

                    // Log adjustment transaction
                    await tx.stockTransaction.create({
                        data: {
                            food_id: foodId,
                            storage_id: storageIdToLog,
                            quantity: quantity, // positive quantity to restore
                            transaction_type: "ADJUSTMENT"
                        }
                    });
                }
            }

            return updatedRation;
        });

        return NextResponse.json({ success: true, pushedRation: updated });

    } catch (error) {
        console.error("Error undoing group completion:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
