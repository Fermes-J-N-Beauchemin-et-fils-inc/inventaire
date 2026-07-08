import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allGroupsFlat = await prisma.group.findMany({
            include: {
                daily_servings: {
                    include: { food: true }
                }
            }
        });

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
            orderBy: [
                { tour1_order: 'asc' },
                { id: 'asc' }
            ]
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
                const needs: Record<string, { food: any, tqs: number, ms: number, isManual: boolean, isTopDress?: boolean, manualName?: string }> = {};
                
                let totalMs = 0;
                let totalTqs = 0;

                group.daily_servings.forEach((serving: any) => {
                    if (serving.reference_group_id) {
                        const refGroup = allGroupsFlat.find(g => g.id === serving.reference_group_id);
                        if (refGroup) {
                            let refTotalMs = 0;
                            let refTotalTqs = 0;
                            const baseServings = refGroup.daily_servings.filter((ds: any) => !ds.is_top_dress && !ds.reference_group_id);
                            baseServings.forEach((ds: any) => {
                                if (!ds.is_manual && ds.food) {
                                    refTotalMs += ds.daily_kg_serving_ms;
                                    refTotalTqs += ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100);
                                } else if (ds.is_manual && ds.manual_ms_percentage !== null) {
                                    refTotalMs += ds.daily_kg_serving_ms;
                                    refTotalTqs += ds.manual_qty_tqs || 0;
                                }
                            });
                            
                            let refAutoWaterTqs = 0;
                            if (refGroup.target_ms_per_cow) {
                                const targetMsPercent = refGroup.target_ms_per_cow;
                                const currentMsPercent = refTotalTqs > 0 ? (refTotalMs / refTotalTqs) * 100 : 0;
                                if (currentMsPercent > targetMsPercent) {
                                    refAutoWaterTqs = (refTotalMs * 100 / targetMsPercent) - refTotalTqs;
                                }
                            }
                            
                            const actualRefTotalTqs = refTotalTqs + refAutoWaterTqs;
                            const targetTqsForWholeGroup = serving.manual_qty_tqs ? serving.manual_qty_tqs * group.animals_fed : 0;
                            
                            if (refTotalTqs > 0) {
                                baseServings.forEach((ds: any) => {
                                    if (!ds.is_manual && ds.food) {
                                        const originalTqs = ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100);
                                        const proportion = originalTqs / actualRefTotalTqs;
                                        
                                        const proportionalTqs = targetTqsForWholeGroup * proportion;
                                        const proportionalMs = proportionalTqs * (ds.food.ms_percentage / 100);
                                        
                                        totalMs += proportionalMs;
                                        totalTqs += proportionalTqs;
                                        
                                        const key = ds.food.id.toString();
                                        if (!needs[key]) {
                                            needs[key] = { food: ds.food, tqs: 0, ms: 0, isManual: false, isTopDress: false };
                                        }
                                        needs[key].tqs += proportionalTqs;
                                        needs[key].ms += proportionalMs;
                                        
                                        availableAliments[ds.food.id.toString()] = {
                                            id: ds.food.id.toString(),
                                            name: ds.food.name,
                                            msPercentage: ds.food.ms_percentage
                                        };
                                    } else if (ds.is_manual) {
                                        const originalTqs = ds.manual_qty_tqs || 0;
                                        const proportion = originalTqs / actualRefTotalTqs;
                                        
                                        const proportionalTqs = targetTqsForWholeGroup * proportion;
                                        const proportionalMs = proportionalTqs * ((ds.manual_ms_percentage || 0) / 100);
                                        
                                        totalMs += proportionalMs;
                                        totalTqs += proportionalTqs;
                                        
                                        const key = `manual_${ds.id}_unpacked`;
                                        if (!needs[key]) {
                                            needs[key] = { 
                                                food: { id: key, name: ds.manual_name || "Manuel", price_per_tqs: 0, price_per_ms: 0 }, 
                                                tqs: 0, 
                                                ms: 0, 
                                                isManual: true, 
                                                isTopDress: false,
                                                manualName: ds.manual_name
                                            };
                                        }
                                        needs[key].tqs += proportionalTqs;
                                        needs[key].ms += proportionalMs;
                                    }
                                });
                                
                                if (refAutoWaterTqs > 0) {
                                    const proportion = refAutoWaterTqs / actualRefTotalTqs;
                                    const proportionalTqs = targetTqsForWholeGroup * proportion;
                                    
                                    totalTqs += proportionalTqs;
                                    
                                    if (!needs['auto_water']) {
                                        needs['auto_water'] = {
                                            food: { id: 'auto_water', name: 'Eau (Ajustement)', price_per_tqs: 0, price_per_ms: 0 },
                                            tqs: 0,
                                            ms: 0,
                                            isManual: true,
                                            isTopDress: false
                                        };
                                    }
                                    needs['auto_water'].tqs += proportionalTqs;
                                }
                            }
                        }
                    } else if (serving.is_manual) {
                        const msPercentage = serving.manual_ms_percentage || 0;
                        const tqs = serving.manual_qty_tqs ? serving.manual_qty_tqs * group.animals_fed : 0;
                        const ms = tqs * (msPercentage / 100);
                        totalMs += ms;
                        totalTqs += tqs;
                        
                        const key = `manual_${serving.id}`;
                        if (!needs[key]) {
                            needs[key] = {
                                food: { id: key, name: serving.manual_name || "Manuel", price_per_tqs: 0, price_per_ms: 0 },
                                tqs: 0,
                                ms: 0,
                                isManual: true,
                                isTopDress: serving.is_top_dress || false,
                                manualName: serving.manual_name
                            };
                        }
                        needs[key].tqs += tqs;
                        needs[key].ms += ms;
                    } else if (serving.food) {
                        const msPercentage = serving.food.ms_percentage || 100;
                        const baseMsPerCow = serving.daily_kg_serving_ms;
                        const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
                        const tqs = baseTqsPerCow * group.animals_fed;
                        const ms = baseMsPerCow * group.animals_fed;
                        totalMs += ms;
                        totalTqs += tqs;
                        
                        const key = serving.is_top_dress ? `${serving.food.id}_topdress` : serving.food.id.toString();
                        if (!needs[key]) {
                            needs[key] = {
                                food: serving.food,
                                tqs: 0,
                                ms: 0,
                                isManual: false,
                                isTopDress: serving.is_top_dress || false
                            };
                        }
                        needs[key].tqs += tqs;
                        needs[key].ms += ms;

                        availableAliments[serving.food.id.toString()] = {
                            id: serving.food.id.toString(),
                            name: serving.food.name,
                            msPercentage: msPercentage
                        };
                    }
                });

                // Calculate water adjustment for this specific group
                if (group.target_ms_per_cow) {
                    const targetMsPercent = group.target_ms_per_cow;
                    const currentMsPercent = totalTqs > 0 ? (totalMs / totalTqs) * 100 : 0;
                    
                    if (currentMsPercent > targetMsPercent) {
                        const waterToAdd = (totalMs * 100 / targetMsPercent) - totalTqs;
                        if (waterToAdd > 0) {
                            needs['auto_water'] = {
                                food: { id: 'auto_water', name: 'Eau (Ajustement)', price_per_tqs: 0, price_per_ms: 0 },
                                tqs: waterToAdd,
                                ms: 0,
                                isManual: true,
                                isTopDress: false
                            };
                        }
                    }
                }

                return { group, needs };
            });

            // 2. Aggregate global needs for the entire batch
            const globalNeeds: Record<string, number> = {};
            groupNeeds.forEach(({ needs }) => {
                Object.entries(needs).forEach(([key, data]) => {
                    globalNeeds[key] = (globalNeeds[key] || 0) + data.tqs;
                });
            });

            // 3. Generate Sequence (Load -> Dump -> Load -> Dump)
            const sequence: any[] = [];
            let currentRtm = 0;
            let hasDumped = false;
            const loadedIngredients = new Set<string>();
            const totalAnimalsFedForBatch = groups.reduce((sum, g) => sum + g.animals_fed, 0);

            groupNeeds.forEach(({ group, needs }) => {
                // Phase A: Load any ingredients needed by this group that haven't been loaded yet
                Object.entries(needs).forEach(([key, data]) => {
                    if (!loadedIngredients.has(key)) {
                        loadedIngredients.add(key);
                        
                        // We load the TOTAL amount needed for the entire batch for this ingredient!
                        const amountToLoad = Math.round(globalNeeds[key]);
                        currentRtm += amountToLoad;
                        
                        let displayName = data.food.name;
                        let highlightClass = undefined;
                        
                        if (data.isTopDress || (!data.isManual && hasDumped)) {
                            highlightClass = 'text-orange-600';
                        }
                        
                        sequence.push({
                            id: (data.isManual || data.isTopDress) ? key : data.food.id.toString(),
                            name: displayName,
                            v1: amountToLoad.toString(),
                            v2: currentRtm.toString(),
                            base_tqs_per_cow: totalAnimalsFedForBatch > 0 ? amountToLoad / totalAnimalsFedForBatch : 0, 
                            price_per_tqs: data.food.price_per_tqs,
                            price_per_ms: data.food.price_per_ms,
                            is_manual: data.isManual,
                            highlight: highlightClass
                        });
                    }
                });

                // Phase B: Dump to this group
                const amountToDump = Math.round(Object.values(needs).reduce((sum, data) => sum + data.tqs, 0));
                console.log(`DUMP GR ${group.id}`, "amountToDump", amountToDump, "currentRtm before", currentRtm, "currentRtm after", currentRtm - amountToDump);
                currentRtm -= amountToDump;
                hasDumped = true;

                const targetRtm = Math.max(0, currentRtm);
                
                const dumpInstruction = targetRtm <= 2 ? `Vider au ${group.name}` : `Vider au ${group.name} jusqu'à ${targetRtm} RTM`;

                sequence.push({
                    id: `dump_${group.id}`,
                    name: dumpInstruction,
                    v1: amountToDump.toString(),
                    v2: targetRtm.toString(),
                    base_tqs_per_cow: totalAnimalsFedForBatch > 0 ? amountToDump / totalAnimalsFedForBatch : 0,
                    price_per_tqs: 0,
                    price_per_ms: 0,
                    is_manual: true,
                    highlight: 'text-green-700 font-bold bg-green-50/50',
                    isDump: true,
                    targetGroupName: group.name
                });
            });

            rationConfig[batchId] = sequence;

            // Compute total animals fed for the virtual group
            const totalAnimalsFed = groups.reduce((sum, g) => sum + g.animals_fed, 0);
            const totalRealAnimals = groups.reduce((sum, g) => sum + g.real_animal_count, 0);

            virtualGroups.push({
                id: batchId,
                name: batchName,
                animals_fed: totalAnimalsFed,
                real_animal_count: totalRealAnimals,
                performance_index: summer_two_meals ? 0.5 : 1.0, // Default to 0.5 if two meals, the Tractor UI can adjust per tour
                season: summer_two_meals ? 'ete' : 'hiver', // Enforce summer UI if two meals checked
                summer_two_meals: summer_two_meals,
                tour1_order: groups[0]?.tour1_order || 999,
                tour2_order: groups[0]?.tour2_order || 999
            });
        };

        // Process actual batches
        batches.forEach(batch => {
            processBatch(`batch_${batch.id}`, batch.name, batch.groups, batch.summer_two_meals);
        });

        // Process unassigned groups as individual batches
        unassignedGroups.forEach(group => {
            processBatch(group.id.toString(), group.name, [group], group.summer_two_meals);
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
