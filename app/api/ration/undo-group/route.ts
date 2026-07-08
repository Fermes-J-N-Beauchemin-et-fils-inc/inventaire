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

            const groupId = parseInt(group_key.split('-')[0]);

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

                    // Cancel original consumption transaction
                    const originalTx = await tx.stockTransaction.findFirst({
                        where: {
                            pushed_ration_id: parseInt(id),
                            food_id: foodId,
                            quantity: -quantity,
                            transaction_type: "CONSUMPTION"
                        }
                    });

                    if (originalTx) {
                        await tx.stockTransaction.update({
                            where: { id: originalTx.id },
                            data: { transaction_type: "CANCELLED_CONSUMPTION" }
                        });
                        
                        // Restore exactly from where it was taken
                        if (originalTx.storage_id) {
                            await tx.foodStorage.update({
                                where: { food_id_storage_id: { food_id: foodId, storage_id: originalTx.storage_id } },
                                data: { current_stock: { increment: quantity } }
                            });
                        }

                        // Log adjustment transaction
                        await tx.stockTransaction.create({
                            data: {
                                food_id: foodId,
                                storage_id: originalTx.storage_id,
                                quantity: quantity, // positive quantity to restore
                                transaction_type: "ROLLBACK_ADJUSTMENT",
                                pushed_ration_id: parseInt(id),
                                group_id: isNaN(groupId) ? null : groupId
                            }
                        });
                    }
                }
            }

            // Delete financial transactions
            await tx.financialTransaction.deleteMany({
                where: { pushed_ration_id: parseInt(id), description: { contains: `(Groupe ${group_key})` } }
            });

            // Delete GroupPerformanceHistory (we just delete one matching entry if multiple exist for tours)
            if (!isNaN(groupId)) {
                const historyEntry = await tx.groupPerformanceHistory.findFirst({
                    where: { pushed_ration_id: parseInt(id), group_id: groupId }
                });
                if (historyEntry) {
                    await tx.groupPerformanceHistory.delete({
                        where: { id: historyEntry.id }
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
