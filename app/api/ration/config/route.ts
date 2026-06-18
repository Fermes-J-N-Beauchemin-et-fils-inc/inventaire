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

            group.daily_servings.forEach(serving => {
                const msPercentage = serving.food.ms_percentage || 100;
                
                // v1 = MS amount = Daily serving (kg) * number of animals fed
                const v1 = serving.daily_kg_serving_ms * group.animals_fed;
                
                // v2 = TQS amount = MS amount / (MS % / 100)
                const v2 = v1 / (msPercentage / 100);

                rationConfig[groupIdStr].push({
                    id: serving.food.id.toString(),
                    name: serving.food.common_name || serving.food.name,
                    v1: Number(v1.toFixed(2)),
                    v2: Number(v2.toFixed(2)),
                    price_per_tqs: serving.food.price_per_tqs, // Include price for accurate snapshot
                    price_per_ms: serving.food.price_per_ms
                });

                // Add to available aliments just in case
                availableAliments[serving.food.id.toString()] = {
                    id: serving.food.id.toString(),
                    name: serving.food.common_name || serving.food.name,
                    msPercentage: msPercentage
                };
            });
        });

        // Also fetch all active foods for the "Add ingredient" modal
        const allFoods = await prisma.food.findMany({
            where: { is_active: true }
        });
        const mappedAliments = allFoods.map(f => ({
            id: f.id.toString(),
            name: f.common_name || f.name,
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
