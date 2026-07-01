import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            include: {
                daily_servings: {
                    include: {
                        food: true
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });
        

        
        const rationConfig: Record<string, any[]> = {};
        const availableAliments: Record<string, any> = {};

        groups.forEach(group => {
            const groupIdStr = group.id.toString();
            rationConfig[groupIdStr] = [];
            
            let currentRtm = 0;

            group.daily_servings.forEach(serving => {
                if (serving.is_manual) {
                    const msPercentage = serving.manual_ms_percentage || 0;
                    const v1 = serving.manual_qty_tqs ? serving.manual_qty_tqs * group.animals_fed : 0;
                    currentRtm += v1;
                    rationConfig[groupIdStr].push({
                        id: `manual_${serving.id}`,
                        name: serving.manual_name || "Manuel",
                        v1: v1.toString(),
                        v2: currentRtm.toString(),
                        base_tqs_per_cow: serving.manual_qty_tqs || 0,
                        price_per_tqs: 0,
                        price_per_ms: 0,
                        is_manual: true
                    });
                } else if (serving.food) {
                    const msPercentage = serving.food.ms_percentage || 100;
                    
                    // Base amount per cow
                    const baseMsPerCow = serving.daily_kg_serving_ms;
                    const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);

                    // v1 = Aliment = formulation of nutrition page (serving.daily_kg_serving_ms) times number of counts (group.animals_fed), factor MS, rounded up
                    const v1 = Math.ceil(baseTqsPerCow * group.animals_fed);
                    
                    // v2 = RTM (Balance) = total of food in mixer when distributor is at this aliment (cumulative sum)
                    currentRtm += v1;
                    const v2 = currentRtm;

                    rationConfig[groupIdStr].push({
                        id: serving.food.id.toString(),
                        name: serving.food.name,
                        v1: v1.toString(),
                        v2: v2.toString(),
                        base_tqs_per_cow: baseTqsPerCow, // Added to allow frontend recalculation
                        price_per_tqs: serving.food.price_per_tqs, // Include price for accurate snapshot
                        price_per_ms: serving.food.price_per_ms
                    });

                    // Add to available aliments just in case
                    availableAliments[serving.food.id.toString()] = {
                        id: serving.food.id.toString(),
                        name: serving.food.name,
                        msPercentage: msPercentage
                    };
                }
            });

            if (group.target_ms_per_cow) {
                const targetMsPercent = group.target_ms_per_cow;
                
                let totalMs = 0;
                let totalTqs = 0;
                
                group.daily_servings.forEach(serving => {
                    if (serving.is_manual) {
                        const msPercentage = serving.manual_ms_percentage || 0;
                        const v1 = serving.manual_qty_tqs ? serving.manual_qty_tqs * group.animals_fed : 0;
                        totalMs += v1 * (msPercentage / 100);
                        totalTqs += v1;
                    } else if (serving.food) {
                        const msPercentage = serving.food.ms_percentage || 100;
                        const baseMsPerCow = serving.daily_kg_serving_ms;
                        const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
                        const v1 = Math.ceil(baseTqsPerCow * group.animals_fed);
                        totalMs += baseMsPerCow * group.animals_fed;
                        totalTqs += v1;
                    }
                });

                const currentMsPercent = totalTqs > 0 ? (totalMs / totalTqs) * 100 : 0;
                
                if (currentMsPercent > targetMsPercent) {
                    const waterToAdd = (totalMs * 100 / targetMsPercent) - totalTqs;
                    if (waterToAdd > 0) {
                        const roundedWater = Math.ceil(waterToAdd);
                        currentRtm += roundedWater;
                        rationConfig[groupIdStr].push({
                            id: 'auto_water',
                            name: 'Eau (Ajustement)',
                            v1: roundedWater.toString(),
                            v2: currentRtm.toString(),
                            base_tqs_per_cow: roundedWater / group.animals_fed,
                            price_per_tqs: 0,
                            price_per_ms: 0,
                            is_manual: true
                        });
                    }
                }
            }
        });

        // Also fetch all active foods for the "Add ingredient" modal
        const allFoods = await prisma.food.findMany({
            where: { is_active: true }
        });
        const mappedAliments = allFoods.map(f => ({
            id: f.id.toString(),
            name: f.name,
            msPercentage: f.ms_percentage
        }));

        return NextResponse.json({
            rationConfig,
            groups: groups.map(g => ({
                id: g.id.toString(),
                name: g.name,
                animals_fed: g.animals_fed,
                real_animal_count: g.real_animal_count,
                performance_index: g.performance_index,
                season: g.season
            })),
            availableAliments: mappedAliments
        });
    } catch (error) {
        console.error('Error generating ration config:', error);
        return NextResponse.json({ error: 'Failed to generate ration config' }, { status: 500 });
    }
}
