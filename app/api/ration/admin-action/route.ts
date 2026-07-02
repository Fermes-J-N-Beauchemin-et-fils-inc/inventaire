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

                // Find all stock transactions associated with this ration
                const stockTx = await tx.stockTransaction.findMany({
                    where: { pushed_ration_id: id, transaction_type: "CONSUMPTION" }
                });

                // Revert inventory
                for (const st of stockTx) {
                    if (st.storage_id && st.quantity < 0) {
                        await tx.foodStorage.update({
                            where: { food_id_storage_id: { food_id: st.food_id, storage_id: st.storage_id } },
                            data: { current_stock: { increment: Math.abs(st.quantity) } }
                        });
                        
                        // Create adjustment log
                        await tx.stockTransaction.create({
                            data: {
                                food_id: st.food_id,
                                storage_id: st.storage_id,
                                quantity: Math.abs(st.quantity),
                                transaction_type: "ROLLBACK_ADJUSTMENT",
                                pushed_ration_id: id
                            }
                        });

                        // Rename original transaction so it doesn't count in comptabilite
                        await tx.stockTransaction.update({
                            where: { id: st.id },
                            data: { transaction_type: "CANCELLED_CONSUMPTION" }
                        });
                    }
                }

                // Delete the financial transactions associated with this ration
                await tx.financialTransaction.deleteMany({
                    where: { pushed_ration_id: id }
                });
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
