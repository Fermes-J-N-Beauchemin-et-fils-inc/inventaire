import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const ration = await prisma.pushedRation.findUnique({ where: { id } });
        if (!ration) {
            return NextResponse.json({ error: "Ration not found" }, { status: 404 });
        }

        if (action === 'cancel') {
            await prisma.$transaction(async (tx) => {
                await tx.pushedRation.update({
                    where: { id },
                    data: { status: 'ANNULEE' }
                });

                const completedKeys = Array.isArray(ration.completed_keys) ? ration.completed_keys : [];
                for (const key of completedKeys) {
                    const rawKey = (key as string).split('-tour')[0];
                    const groupSequence = (ration.payload as any)?.[rawKey];
                    // Handle both old group format and new sequence array format
                    const alimentsToRestore = Array.isArray(groupSequence) ? groupSequence : groupSequence?.aliments;
                    if (alimentsToRestore) {
                        for (const a of alimentsToRestore) {
                            const foodId = parseInt(a.id);
                            const quantityInKg = parseFloat(a.v1);
                            if (!foodId || isNaN(quantityInKg) || quantityInKg <= 0) continue;

                            const food = await tx.food.findUnique({
                                where: { id: foodId },
                                include: { unit_type: true }
                            });
                            let rationToKg = food?.unit_type?.ration_to_kg || 1;
                            if (rationToKg === 1 && food?.unit_type?.name?.toLowerCase() === 'tm') {
                                rationToKg = 1000;
                            }
                            const quantity = quantityInKg / rationToKg;

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

                            await tx.stockTransaction.create({
                                data: {
                                    food_id: foodId,
                                    storage_id: storageIdToLog,
                                    quantity: quantity,
                                    transaction_type: "ADJUSTMENT"
                                }
                            });
                        }
                    }
                }
            });
            return NextResponse.json({ success: true, message: "Ration annulée et inventaire restauré." });
        }

        if (action === 'finish') {
            await prisma.pushedRation.update({
                where: { id },
                data: { status: 'TERMINEE' }
            });
            return NextResponse.json({ success: true, message: "Ration terminée de force." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in admin-action:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
