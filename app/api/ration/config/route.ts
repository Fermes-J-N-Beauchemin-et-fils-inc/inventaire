import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const batches = await prisma.mixBatch.findMany({
            include: {
                groups: {
                    orderBy: { mix_order: 'asc' },
                    include: {
                        daily_servings: {
                            include: { food: true }
                        }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
        
        const unassignedGroups = await prisma.group.findMany({
            where: { mix_batch_id: null },
            include: {
                daily_servings: {
                    include: { food: true }
                }
            },
            orderBy: { id: 'asc' }
        });

        // We will transform MixBatches into "virtual groups" for the Tractor UI.
        // And unassigned groups will also be treated as their own batch.
        
        const rationConfig: Record<string, any[]> = {};
        const availableAliments: Record<string, any> = {};
        const virtualGroups: any[] = [];

        // Helper to process a list of groups into a single batch sequence
        const processBatch = (batchId: string, batchName: string, groups: any[], summer_two_meals: boolean) => {
            if (groups.length === 0) return;

            // 1. Calculate the exact needs for each group
            const groupNeeds = groups.map(group => {
                const needs: Record<string, { food: any, tqs: number, tqs_per_cow: number, ms: number, isManual: boolean, manualName?: string }> = {};
                
                let totalMs = 0;
                let totalTqs = 0;

                group.daily_servings.forEach((serving: any) => {
                    if (serving.is_manual) {
                        const msPercentage = serving.manual_ms_percentage || 0;
                        const tqs_per_cow = serving.manual_qty_tqs || 0;
                        const tqs = tqs_per_cow * group.animals_fed;
                        const ms = tqs * (msPercentage / 100);
                        totalMs += ms;
                        totalTqs += tqs;
                        
                        const key = `manual_${serving.id}`;
                        needs[key] = {
                            food: { id: key, name: serving.manual_name || "Manuel", price_per_tqs: 0, price_per_ms: 0 },
                            tqs,
                            tqs_per_cow,
                            ms,
                            isManual: true,
                            manualName: serving.manual_name
                        };
                    } else if (serving.food) {
                        const msPercentage = serving.food.ms_percentage || 100;
                        const baseMsPerCow = serving.daily_kg_serving_ms;
                        const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
                        const tqs = baseTqsPerCow * group.animals_fed;
                        const ms = baseMsPerCow * group.animals_fed;
                        totalMs += ms;
                        totalTqs += tqs;
                        
                        const key = serving.food.id.toString();
                        needs[key] = {
                            food: serving.food,
                            tqs,
                            tqs_per_cow: baseTqsPerCow,
                            ms,
                            isManual: false
                        };

                        availableAliments[key] = {
                            id: key,
                            name: serving.food.name,
                            msPercentage: msPercentage
                        };
                    }
                });

                if (group.target_ms_per_cow && group.animals_fed > 0) {
                    const targetMsPercent = group.target_ms_per_cow;
                    const currentMsPercent = totalTqs > 0 ? (totalMs / totalTqs) * 100 : 0;
                    
                    if (currentMsPercent > targetMsPercent) {
                        const waterToAdd = (totalMs * 100 / targetMsPercent) - totalTqs;
                        if (waterToAdd > 0) {
                            needs['auto_water'] = {
                                food: { id: 'auto_water', name: 'Eau (Ajustement)', price_per_tqs: 0, price_per_ms: 0 },
                                tqs: waterToAdd,
                                tqs_per_cow: waterToAdd / group.animals_fed,
                                ms: 0,
                                isManual: true
                            };
                        }
                    }
                }

                return { group, needs };
            });

            // 2. Identify all unique ingredients across the batch
            const allIngredientKeys = new Set<string>();
            groupNeeds.forEach(({ needs }) => {
                Object.keys(needs).forEach(key => allIngredientKeys.add(key));
            });

            // 3. Determine the "Base Mix" (Minimum tqs_per_cow for each ingredient)
            const baseMix: Record<string, number> = {};
            allIngredientKeys.forEach(key => {
                let minTqsPerCow = Infinity;
                groupNeeds.forEach(({ needs }) => {
                    const tqsPerCow = needs[key] ? needs[key].tqs_per_cow : 0;
                    if (tqsPerCow < minTqsPerCow) {
                        minTqsPerCow = tqsPerCow;
                    }
                });
                baseMix[key] = minTqsPerCow;
            });

            const sequence: any[] = [];
            let currentRtm = 0;
            const totalAnimalsFedForBatch = groups.reduce((sum, g) => sum + g.animals_fed, 0);

            // 4. Generate Load instructions for the Base Mix
            Object.entries(baseMix).forEach(([key, baseTqsPerCow]) => {
                if (baseTqsPerCow > 0 && totalAnimalsFedForBatch > 0) {
                    const amountToLoad = Math.round(baseTqsPerCow * totalAnimalsFedForBatch);
                    
                    if (amountToLoad > 0) {
                        currentRtm += amountToLoad;
                        
                        let foodData: any = null;
                        for (const { needs } of groupNeeds) {
                            if (needs[key]) {
                                foodData = needs[key];
                                break;
                            }
                        }
                        
                        sequence.push({
                            id: foodData.isManual ? key : foodData.food.id.toString(),
                            name: foodData.food.name,
                            v1: amountToLoad.toString(),
                            v2: currentRtm.toString(),
                            base_tqs_per_cow: baseTqsPerCow,
                            price_per_tqs: foodData.food.price_per_tqs,
                            price_per_ms: foodData.food.price_per_ms,
                            is_manual: foodData.isManual,
                            highlight: undefined
                        });
                    }
                }
            });

            // 5. Iterate through groups to generate Top-Dress and Dumps
            groupNeeds.forEach(({ group, needs }) => {
                // Phase A: Top-Dress for this group
                Object.entries(needs).forEach(([key, data]) => {
                    const baseTqsPerCow = baseMix[key] || 0;
                    const topDressTqsPerCow = data.tqs_per_cow - baseTqsPerCow;
                    
                    // We only add top dress if the difference is significant (> 0.01 kg/cow)
                    if (topDressTqsPerCow > 0.01 && group.animals_fed > 0) {
                        const topDressAmount = Math.round(topDressTqsPerCow * group.animals_fed);
                        if (topDressAmount > 0) {
                            currentRtm += topDressAmount;
                            
                            sequence.push({
                                id: data.isManual ? key : data.food.id.toString(),
                                name: data.food.name,
                                v1: topDressAmount.toString(),
                                v2: currentRtm.toString(),
                                base_tqs_per_cow: totalAnimalsFedForBatch > 0 ? topDressAmount / totalAnimalsFedForBatch : 0,
                                price_per_tqs: data.food.price_per_tqs,
                                price_per_ms: data.food.price_per_ms,
                                is_manual: data.isManual,
                                highlight: 'text-orange-600'
                            });
                        }
                    }
                });

                // Phase B: Dump to this group
                const amountToDump = Math.round(Object.values(needs).reduce((sum, data) => sum + data.tqs, 0));
                currentRtm -= amountToDump;

                const targetRtm = Math.max(0, currentRtm);

                sequence.push({
                    id: `dump_${group.id}`,
                    name: `DUMP au ${group.name} jusqu'à ${targetRtm} RTM`,
                    v1: amountToDump.toString(),
                    v2: targetRtm.toString(),
                    base_tqs_per_cow: totalAnimalsFedForBatch > 0 ? amountToDump / totalAnimalsFedForBatch : 0,
                    price_per_tqs: 0,
                    price_per_ms: 0,
                    is_manual: true,
                    highlight: 'text-green-700',
                    isDump: true,
                    targetGroupName: group.name
                });
            });

            rationConfig[batchId] = sequence;

            const totalAnimalsFed = groups.reduce((sum, g) => sum + g.animals_fed, 0);
            const totalRealAnimals = groups.reduce((sum, g) => sum + g.real_animal_count, 0);

            virtualGroups.push({
                id: batchId,
                name: batchName,
                animals_fed: totalAnimalsFed,
                real_animal_count: totalRealAnimals,
                performance_index: summer_two_meals ? 0.5 : 1.0,
                season: summer_two_meals ? 'ete' : 'hiver',
                summer_two_meals: summer_two_meals
            });
        };

        // Process actual batches
        batches.forEach(batch => {
            processBatch(`batch_${batch.id}`, batch.name, batch.groups, batch.summer_two_meals);
        });

        // Process unassigned groups as individual batches
        unassignedGroups.forEach(group => {
            processBatch(`group_${group.id}`, group.name, [group], false);
        });

        // Also fetch all active foods for the "Add ingredient" modal
        const allFoods = await prisma.food.findMany({
            where: { is_active: true }
        });
        allFoods.forEach(f => {
            availableAliments[f.id.toString()] = {
                id: f.id.toString(),
                name: f.name,
                msPercentage: f.ms_percentage
            };
        });
        // Fetch the absolute last pushed ration to be used as a template
        const lastPushedRation = await prisma.pushedRation.findFirst({
            orderBy: { id: 'desc' }
        });

        return NextResponse.json({
            rationConfig,
            groups: virtualGroups,
            availableAliments: Object.values(availableAliments),
            lastPushedRation
        });
    } catch (error) {
        console.error('Error generating ration config:', error);
        return NextResponse.json({ error: 'Failed to generate ration config' }, { status: 500 });
    }
}
