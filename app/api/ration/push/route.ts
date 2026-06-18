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
        const { groups, groups_total, saison, globalPluie } = body;

        if (!groups || typeof groups_total !== 'number') {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Check if there is already an active ration for today, if so, maybe we mark it as replaced or just let it be.
        // For simplicity, we just create a new one. The GET active will fetch the latest one.

        const foods = await prisma.food.findMany();
        const groupsData = await prisma.group.findMany();

        const [newRation] = await prisma.$transaction([
            prisma.pushedRation.create({
                data: {
                    groups_total,
                    payload: groups,
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
        ]);

        return NextResponse.json({ success: true, pushedRation: newRation });
    } catch (error) {
        console.error("Error pushing ration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
