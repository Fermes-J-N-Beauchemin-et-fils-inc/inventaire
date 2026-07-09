import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, action, currentGroups, globalPluie } = body;

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

                // Delete the performance history associated with this ration
                await tx.groupPerformanceHistory.deleteMany({
                    where: { pushed_ration_id: id }
                });
            });
            return NextResponse.json({ success: true, message: "Ration annulée et inventaire restauré." });
        }

        if (action === 'finish') {
            await prisma.$transaction(async (tx) => {
                const r = await tx.pushedRation.findUnique({ where: { id } });
                if (!r) throw new Error("Ration not found");

                const payload = r.payload as any;
                const completedKeys = Array.isArray(r.completed_keys) ? [...r.completed_keys] : [];
                
                if (currentGroups && payload && payload.groups) {
                    payload.groups = { ...payload.groups, ...currentGroups };
                }
                if (globalPluie && payload) {
                    payload.globalPluie = globalPluie;
                }

                if (payload && payload.groups) {
                    const tour1Keys = payload.tour1Keys || Object.keys(payload.groups);
                    const tour2Keys = payload.tour2Keys || [];
                    
                    const allKeysToProcess: { baseKey: string, tour: 1 | 2, fullKey: string }[] = [];
                    
                    for (const k of tour1Keys) {
                        const fk = `${k}-tour1`;
                        if (!completedKeys.includes(fk) && payload.groups[k]) {
                            allKeysToProcess.push({ baseKey: k, tour: 1, fullKey: fk });
                        }
                    }
                    for (const k of tour2Keys) {
                        const fk = `${k}-tour2`;
                        if (!completedKeys.includes(fk) && payload.groups[k]) {
                            allKeysToProcess.push({ baseKey: k, tour: 2, fullKey: fk });
                        }
                    }
                    
                    for (const item of allKeysToProcess) {
                        const groupKey = item.baseKey;
                        const groupData = payload.groups[groupKey];
                        const groupId = parseInt(groupKey);
                        
                        let cowsFed = parseInt(groupData.fed) || parseInt(groupData.real) || 0;
                        const indiceStr = item.tour === 1 ? groupData.indice : (groupData.indiceTour2 || "1.00");
                        const indice = parseFloat(indiceStr || "1");

                        let totalGroupCost = 0;
                        let totalGroupKgMs = 0;
                        let totalGroupKgTqs = 0;

                        for (const aliment of groupData.aliments || []) {
                            if (aliment.isDump || aliment.isInstruction) continue;

                            const foodIdStr = aliment.food?.id || aliment.id;
                            if (!foodIdStr) continue;
                            
                            const foodId = parseInt(foodIdStr.toString().replace('manual_', ''));
                            if (isNaN(foodId)) continue;

                            const quantityInKg = Math.ceil((parseFloat(aliment.v1) || 0) * indice);
                            
                            if (quantityInKg <= 0) continue;

                                const food = await tx.food.findUnique({
                                    where: { id: foodId },
                                    include: { unit_type: true }
                                });
                                
                                if (!food) continue;

                                let rationToKg = food.unit_type?.ration_to_kg || 1;
                                if (rationToKg === 1 && food.unit_type?.name?.toLowerCase() === 'tm') {
                                    rationToKg = 1000;
                                }
                                const quantity = quantityInKg / rationToKg;

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

                                const cost = (quantityInKg / 1000) * (food.price_per_tqs || 0);
                                const ms = quantityInKg * (food.ms_percentage || 0) / 100;
                                
                                totalGroupCost += cost;
                                totalGroupKgTqs += quantityInKg;
                                totalGroupKgMs += ms;

                                await tx.stockTransaction.create({
                                    data: {
                                        food_id: foodId,
                                        storage_id: storageIdToLog,
                                        pushed_ration_id: id,
                                        group_id: isNaN(groupId) ? null : groupId,
                                        quantity: -quantity,
                                        transaction_type: "CONSUMPTION",
                                        financial_cost: cost
                                    }
                                });

                                if (cost > 0) {
                                    await tx.financialTransaction.create({
                                        data: {
                                            date: new Date(),
                                            type: "OUT",
                                            category: "Alimentation",
                                            amount: cost,
                                            pushed_ration_id: id,
                                            description: `Coût alimentation: ${food.name} (Groupe ${groupKey} - Clôture forcée)`,
                                        }
                                    });
                                }
                            }

                            if (!isNaN(groupId) && totalGroupKgTqs > 0) {
                                await tx.groupPerformanceHistory.create({
                                    data: {
                                        group_id: groupId,
                                        date: new Date(),
                                        pushed_ration_id: id,
                                        cows_fed: cowsFed,
                                        total_kg_ms: totalGroupKgMs,
                                        total_kg_tqs: totalGroupKgTqs,
                                        total_cost: totalGroupCost
                                    }
                                });
                            }

                            completedKeys.push(item.fullKey);
                    }
                }

                await tx.pushedRation.update({
                    where: { id },
                    data: { 
                        status: 'TERMINEE',
                        completed_keys: completedKeys,
                        groups_done: completedKeys.length,
                        payload: payload
                    }
                });
            });

            return NextResponse.json({ success: true, message: "Ration terminée de force avec déduction de l'inventaire." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in admin-action:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
