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
        const foods = await prisma.food.findMany();
        const groupsData = await prisma.group.findMany(); // Still need this for snapshot

        // Fetch config to know current batches and groups
        const { GET: getConfig } = await import("../../ration/config/route");
        const configResponse = await getConfig();
        const configData = await configResponse.json();
        const { rationConfig, groups: virtualGroups } = configData;

        const newGroupsPayload: any = {};
        const currentSaison = payload.saison || 'hiver';

        // 3. Rebuild groups using virtualGroups from config
        for (const vg of virtualGroups) {
            const key = vg.id.toString();
            
            if (groupsPayload[key]) {
                const groupCopy = { ...groupsPayload[key] };
                groupCopy.fed = vg.real_animal_count;
                groupCopy.real = vg.real_animal_count;

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
                            newName = targetRtm <= 2
                                ? `Vider au ${targetGroupName}`
                                : `Vider au ${targetGroupName} jusqu'à ${targetRtm} RTM`;
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
            } else {
                // Group is missing! Generate it from configData
                const baseAliments = rationConfig[key] || [];
                const mergedAliments = baseAliments
                    .filter((a: any) => parseFloat(a.v1) > 0 || a.isInstruction || a.isDump)
                    .map((a: any) => ({
                        ...a,
                        rowId: Math.random().toString(36).substring(2, 11)
                    }));
                
                let currentRtm = 0;
                mergedAliments.forEach((a: any) => {
                    let v1Num = parseFloat(a.v1) || 0;
                    if (a.base_tqs_per_cow) {
                        v1Num = Math.ceil(a.base_tqs_per_cow * vg.real_animal_count);
                    }
                    a.v1 = v1Num.toString();
                    
                    if (a.isDump) {
                        currentRtm -= v1Num;
                        a.v2 = Math.max(0, currentRtm).toString();
                        const targetGroupName = a.targetGroupName || vg.name;
                        const targetRtm = Math.max(0, currentRtm);
                        a.name = targetRtm <= 2
                            ? `Vider au ${targetGroupName}`
                            : `Vider au ${targetGroupName} jusqu'à ${targetRtm} RTM`;
                    } else {
                        currentRtm += v1Num;
                        a.v2 = Math.max(0, currentRtm).toString();
                    }
                });

                newGroupsPayload[key] = {
                    name: vg.name,
                    real: vg.real_animal_count,
                    fed: vg.real_animal_count,
                    summer_two_meals: vg.summer_two_meals,
                    indice: currentSaison === 'ete' ? (vg.summer_two_meals ? "0.50" : "1.00") : "1.00",
                    indiceTour2: currentSaison === 'ete' ? (vg.summer_two_meals ? "0.50" : "0.25") : "0.25",
                    time: "",
                    note: "",
                    systemNote: "",
                    foinSec: "0",
                    aliments: mergedAliments
                };
            }
        }
        
        payload.groups = newGroupsPayload;

        // Rebuild tour keys using current config order
        payload.tour1Keys = virtualGroups.map((vg: any) => vg.id.toString());
        payload.tour2Keys = currentSaison === 'ete' ? virtualGroups
            .filter((vg: any) => vg.summer_two_meals)
            .sort((a: any, b: any) => (a.tour2_order ?? 999) - (b.tour2_order ?? 999))
            .map((vg: any) => vg.id.toString()) : [];
            
        // Calculate groups total
        const activeTour1 = payload.tour1Keys.filter((k: string) => payload.groups[k] && payload.groups[k].fed > 0);
        const activeTour2 = payload.tour2Keys.filter((k: string) => payload.groups[k] && payload.groups[k].fed > 0);
        const newGroupsTotal = activeTour1.length + activeTour2.length;

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
