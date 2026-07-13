import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getQuebecMidnight } from "@/app/lib/dateUtils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        
        // Simple security: check token from env
        const cronSecret = process.env.CRON_SECRET;
        
        if (!cronSecret || token !== cronSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const midnight = getQuebecMidnight();

        // 1. Check if already pushed today
        const pushedToday = await prisma.pushedRation.findFirst({
            where: { date: { gte: midnight } }
        });

        if (pushedToday) {
            return NextResponse.json({ success: true, message: "Ration already pushed today." });
        }

        // 2. Get last pushed ration
        const lastRation = await prisma.pushedRation.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!lastRation) {
            return NextResponse.json({ success: false, message: "No previous ration to copy." });
        }

        const payload = lastRation.payload as any;
        if (!payload || !payload.groups) {
            return NextResponse.json({ success: false, message: "Invalid payload in last ration." });
        }

        const groupsPayload = payload.groups;
        const groupsData = await prisma.group.findMany();
        const foods = await prisma.food.findMany();

        let newGroupsTotal = 0;
        const newGroupsPayload: any = {};

        // 3. Update fed cows with real_animal_count and filter out deleted groups
        for (const gData of groupsData) {
            const key = gData.id.toString();
            if (groupsPayload[key]) {
                const groupCopy = { ...groupsPayload[key] };
                groupCopy.fed = gData.real_animal_count;
                groupCopy.real = gData.real_animal_count;

                // Recalculate aliments based on the new fed amount
                if (Array.isArray(groupCopy.aliments)) {
                    let currentRtm = 0;
                    groupCopy.aliments = groupCopy.aliments.map((a: any) => {
                        let v1Num = parseFloat(a.v1) || 0;
                        if (a.base_tqs_per_cow) {
                            v1Num = Math.ceil(a.base_tqs_per_cow * groupCopy.fed);
                        }
                        
                        let newName = a.name;
                        if (a.isDump) {
                            currentRtm -= v1Num;
                            const targetGroupName = a.targetGroupName || groupCopy.name;
                            const targetRtm = Math.max(0, currentRtm);
                            newName = targetRtm < 10
                                ? `Vider tout au ${targetGroupName}`
                                : `DUMP au ${targetGroupName} jusqu'à ${targetRtm} RTM`;
                        } else {
                            currentRtm += v1Num;
                        }
                        
                        return {
                            ...a,
                            name: newName,
                            v1: v1Num.toString(),
                            v2: Math.max(0, currentRtm).toString()
                        };
                    });
                }

                newGroupsPayload[key] = groupCopy;
                newGroupsTotal += gData.real_animal_count;
            }
        }
        payload.groups = newGroupsPayload;

        // Clean up tour keys just in case a group was deleted
        if (payload.tour1Keys) {
            payload.tour1Keys = payload.tour1Keys.filter((key: string) => newGroupsPayload[key]);
        }
        if (payload.tour2Keys) {
            payload.tour2Keys = payload.tour2Keys.filter((key: string) => newGroupsPayload[key]);
        }

        const transactions: any[] = [
            prisma.pushedRation.create({
                data: {
                    groups_total: newGroupsTotal,
                    payload: payload,
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
                    const groupFrontend = payload.groups[groupKey];
                    const weather = groupFrontend?.pluieMode && groupFrontend.pluieMode !== 'global' 
                        ? groupFrontend.pluieMode 
                        : (payload.globalPluie || g.weather || 'normal');
                        
                    return {
                        group_id: g.id,
                        real_animal_count: g.real_animal_count,
                        animals_fed: g.real_animal_count, // Use real here too since we auto-pushed it
                        performance_index: g.performance_index,
                        weather: weather,
                        season: payload.saison || g.season
                    };
                })
            })
        ];

        const [newRation] = await prisma.$transaction(transactions);

        return NextResponse.json({ success: true, message: "Auto-pushed ration successfully.", pushedRation: newRation });
    } catch (error) {
        console.error("Error in auto-push cron:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
