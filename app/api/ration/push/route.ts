import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { groups, groups_total, saison, globalPluie, tour1Keys, tour2Keys } = body;

        if (!groups || typeof groups_total !== 'number') {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Check if there is already an active ration for today, if so, maybe we mark it as replaced or just let it be.
        // For simplicity, we just create a new one. The GET active will fetch the latest one.

        const foods = await prisma.food.findMany();
        const groupsData = await prisma.group.findMany();

        // Calculate total food consumption across all groups
        const foodTotals: Record<number, number> = {};
        for (const [key, group] of Object.entries(groups as Record<string, any>)) {
            if (group.fed && group.fed > 0 && group.aliments) {
                for (const aliment of group.aliments) {
                    const foodId = parseInt(aliment.id, 10);
                    const amount = parseFloat(aliment.v1) || 0;
                    if (!isNaN(foodId) && amount > 0) {
                        foodTotals[foodId] = (foodTotals[foodId] || 0) + amount;
                    }
                }
            }
        }

        const transactions: any[] = [
            prisma.pushedRation.create({
                data: {
                    groups_total,
                    payload: { groups, tour1Keys, tour2Keys, saison, globalPluie },
                    completed_keys: [],
                }
            }),
            prisma.foodSnapshot.createMany({
                data: foods.map(f => ({
                    food_id: f.id,
                    ms_percentage: f.ms_percentage,
                    price_per_ms: f.price_per_ms,
                    price_per_tqs: f.price_per_tqs
                }))
            }),
            prisma.groupSnapshot.createMany({
                data: groupsData.map(g => {
                    const groupKey = g.id.toString();
                    const groupFrontend = groups[groupKey];
                    const weather = groupFrontend?.pluieMode && groupFrontend.pluieMode !== 'global' 
                        ? groupFrontend.pluieMode 
                        : (globalPluie || g.weather || 'normal');
                        
                    return {
                        group_id: g.id,
                        real_animal_count: g.real_animal_count,
                        animals_fed: g.animals_fed,
                        performance_index: g.performance_index,
                        weather: weather,
                        season: saison || g.season
                    };
                })
            })
        ];

        // Deduct inventory for each food used and calculate total cost
        let totalRationCost = 0;
        for (const [foodIdStr, amount] of Object.entries(foodTotals)) {
            const foodId = parseInt(foodIdStr, 10);
            
            const food = foods.find(f => f.id === foodId);
            if (food) {
                // Assuming amount is in KG and price_per_tqs is per Tonne
                totalRationCost += (amount / 1000) * food.price_per_tqs;
            }

            // Find the first storage for this food to deduct from
            const storage = await prisma.foodStorage.findFirst({
                where: { food_id: foodId }
            });

            if (storage) {
                transactions.push(
                    prisma.foodStorage.update({
                        where: {
                            food_id_storage_id: {
                                food_id: foodId,
                                storage_id: storage.storage_id
                            }
                        },
                        data: {
                            current_stock: {
                                decrement: amount
                            }
                        }
                    })
                );
            }
        }

        // Log the financial transaction for the day's ration
        if (totalRationCost > 0) {
            transactions.push(
                prisma.financialTransaction.create({
                    data: {
                        date: new Date(),
                        type: "OUT",
                        category: "Alimentation",
                        amount: totalRationCost,
                        description: `Coût ration globale (${Object.keys(groups).length} groupes)`,
                    }
                })
            );
        }

        const [newRation] = await prisma.$transaction(transactions);

        return NextResponse.json({ success: true, pushedRation: newRation });
    } catch (error) {
        console.error("Error pushing ration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
