import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getQuebecMidnight, QUEBEC_TIMEZONE, getQuebecDateString } from '@/app/lib/dateUtils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        if (!dateParam) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const [year, month, day] = dateParam.split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        // Fetch transactions for the day (Consumption only)
        const dailyTransactions = await prisma.stockTransaction.findMany({
            where: {
                recorded_at: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                transaction_type: 'CONSUMPTION'
            },
            include: {
                food: true
            }
        });

        // Also fetch the PushedRation for that day to get group stats (if any)
        const pushedRation = await prisma.pushedRation.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        let totalDailyCost = 0;
        let totalDailyVolume = 0;
        let foinSecVolume = 0;
        
        // Sum up from transactions
        dailyTransactions.forEach(t => {
            const consumedKg = Math.abs(t.quantity); // negative in DB
            const cost = t.financial_cost !== null 
                ? t.financial_cost 
                : consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
            
            // Foin sec nourris à part (id 8 typically or by name)
            if (t.food?.id === 8 || t.food?.name.toLowerCase().includes('foin sec')) {
                foinSecVolume += consumedKg;
            } else {
                totalDailyVolume += consumedKg;
                totalDailyCost += cost;
            }
        });

        const dailySummary = {
            totalCostToday: totalDailyCost,
            costPerCow: pushedRation ? totalDailyCost / Math.max(1, pushedRation.groups_total * 50) : 0, 
            totalWeightTqsToday: totalDailyVolume,
            foinSecNourrisKg: foinSecVolume,
            salesRevenue: 0
        };

        // For Annual, we fetch all consumption transactions grouped by month
        const startOfYear = new Date(startOfDay.getFullYear(), 0, 1);
        const annualTransactions = await prisma.stockTransaction.findMany({
            where: {
                recorded_at: {
                    gte: startOfYear
                },
                transaction_type: 'CONSUMPTION'
            },
            include: { food: true }
        });

        const monthlyCosts = new Array(12).fill(0);
        let annualTotalCost = 0;
        let annualTotalVolume = 0;

        annualTransactions.forEach(t => {
            const monthIndex = t.recorded_at.getMonth();
            const consumedKg = Math.abs(t.quantity);
            const cost = t.financial_cost !== null 
                ? t.financial_cost 
                : consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
            
            monthlyCosts[monthIndex] += cost;
            annualTotalCost += cost;
            annualTotalVolume += consumedKg;
        });

        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const graphData = monthlyCosts.map((cost, i) => ({
            month: monthNames[i],
            monthlyReal: cost,
            monthlyExpected: cost // simplistic mock for expected
        }));

        const annualBilan = {
            totalCost: annualTotalCost,
            totalVolumeKg: annualTotalVolume,
            averageCostPerDay: annualTotalCost / Math.max(1, Math.ceil((new Date().getTime() - startOfYear.getTime()) / (1000 * 3600 * 24))),
            salesRevenue: 0
        };

        // Parse groups from pushedRation payload for the GroupsDataView
        // Try to get FoodSnapshots for that day to use historical prices/MS
        const dailyFoodSnapshots = await prisma.foodSnapshot.findMany({
            where: {
                recorded_at: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        const allFoods = await prisma.food.findMany();
        
        const getFoodData = (foodId: number) => {
            const snapshot = dailyFoodSnapshots.find(s => s.food_id === foodId);
            const currentFood = allFoods.find(f => f.id === foodId);
            if (!currentFood) return null;
            if (snapshot) {
                return {
                    id: foodId,
                    name: currentFood.name,
                    ms_percentage: snapshot.ms_percentage,
                    price_per_ms: snapshot.price_per_ms,
                    price_per_tqs: snapshot.price_per_tqs
                };
            }
            return currentFood;
        };

        const thirtyDaysAgoForHistory = new Date(startOfDay);
        thirtyDaysAgoForHistory.setDate(thirtyDaysAgoForHistory.getDate() - 30);
        
        const historicalRations = await prisma.pushedRation.findMany({
            where: {
                date: {
                    gte: thirtyDaysAgoForHistory,
                    lt: startOfDay
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        const thirtyDaysSnapshots = await prisma.foodSnapshot.findMany({
            where: {
                recorded_at: {
                    gte: thirtyDaysAgoForHistory,
                    lte: startOfDay
                }
            }
        });

        const getHistoricalPrice = (foodId: number, dateStr: string) => {
            const snapshot = thirtyDaysSnapshots.find(s => s.food_id === foodId && getQuebecDateString(s.recorded_at) === dateStr);
            if (snapshot && snapshot.price_per_tqs !== null) return snapshot.price_per_tqs;
            const currentFood = allFoods.find(f => f.id === foodId);
            return currentFood ? (currentFood.price_per_tqs || 0) : 0;
        };
        
        const rationsByDay: Record<string, any> = {};
        historicalRations.forEach(r => {
            const dStr = getQuebecDateString(r.date);
            if (!rationsByDay[dStr]) {
                rationsByDay[dStr] = r;
            }
        });
        
        const historyAgg = {
            yesterdayGroup: {} as Record<string, number>,
            yesterdayAliment: {} as Record<string, number>,
            sevenDaysGroup: {} as Record<string, number>,
            sevenDaysAliment: {} as Record<string, number>,
            thirtyDaysGroup: {} as Record<string, number>,
            thirtyDaysAliment: {} as Record<string, number>,
            yesterdayGroupCost: {} as Record<string, number>,
            yesterdayAlimentCost: {} as Record<string, number>,
            sevenDaysGroupCost: {} as Record<string, number>,
            sevenDaysAlimentCost: {} as Record<string, number>,
            thirtyDaysGroupCost: {} as Record<string, number>,
            thirtyDaysAlimentCost: {} as Record<string, number>,
            sevenDaysCount: 0,
            thirtyDaysCount: 0,
        };

        const yesterdayStr = getQuebecDateString(new Date(startOfDay.getTime() - 86400000));
        
        for (let i = 1; i <= 30; i++) {
            const d = new Date(startOfDay);
            d.setDate(d.getDate() - i);
            const dStr = getQuebecDateString(d);
            
            const r = rationsByDay[dStr];
            if (r && (r.payload as any)?.groups) {
                historyAgg.thirtyDaysCount++;
                if (i <= 7) historyAgg.sevenDaysCount++;
                
                const payloadGroups = (r.payload as any).groups;
                Object.entries(payloadGroups).forEach(([gKey, gData]: [string, any]) => {
                    let groupTqs = 0;
                    let groupCost = 0;
                    if (gData.aliments && Array.isArray(gData.aliments)) {
                        gData.aliments.forEach((al: any) => {
                            const tqs = parseFloat(al.v1) || 0;
                            if (tqs > 0) {
                                groupTqs += tqs;
                                const fId = parseInt(al.food?.id || al.id, 10);
                                const alId = `${gKey}_${fId}`;
                                const priceTqs = getHistoricalPrice(fId, dStr);
                                const costDay = tqs * (priceTqs / 1000);
                                groupCost += costDay;
                                
                                historyAgg.thirtyDaysAliment[alId] = (historyAgg.thirtyDaysAliment[alId] || 0) + tqs;
                                historyAgg.thirtyDaysAlimentCost[alId] = (historyAgg.thirtyDaysAlimentCost[alId] || 0) + costDay;
                                if (i <= 7) {
                                    historyAgg.sevenDaysAliment[alId] = (historyAgg.sevenDaysAliment[alId] || 0) + tqs;
                                    historyAgg.sevenDaysAlimentCost[alId] = (historyAgg.sevenDaysAlimentCost[alId] || 0) + costDay;
                                }
                                if (dStr === yesterdayStr) {
                                    historyAgg.yesterdayAliment[alId] = (historyAgg.yesterdayAliment[alId] || 0) + tqs;
                                    historyAgg.yesterdayAlimentCost[alId] = (historyAgg.yesterdayAlimentCost[alId] || 0) + costDay;
                                }
                            }
                        });
                    }
                    historyAgg.thirtyDaysGroup[gKey] = (historyAgg.thirtyDaysGroup[gKey] || 0) + groupTqs;
                    historyAgg.thirtyDaysGroupCost[gKey] = (historyAgg.thirtyDaysGroupCost[gKey] || 0) + groupCost;
                    if (i <= 7) {
                        historyAgg.sevenDaysGroup[gKey] = (historyAgg.sevenDaysGroup[gKey] || 0) + groupTqs;
                        historyAgg.sevenDaysGroupCost[gKey] = (historyAgg.sevenDaysGroupCost[gKey] || 0) + groupCost;
                    }
                    if (dStr === yesterdayStr) {
                        historyAgg.yesterdayGroup[gKey] = (historyAgg.yesterdayGroup[gKey] || 0) + groupTqs;
                        historyAgg.yesterdayGroupCost[gKey] = (historyAgg.yesterdayGroupCost[gKey] || 0) + groupCost;
                    }
                });
            }
        }
        
        const getDiff = (current: number, histTotal: number, count: number) => {
            if (count === 0 || histTotal === 0) return 0;
            const avg = histTotal / count;
            return ((current - avg) / avg) * 100;
        };

        const groups: any[] = [];
        let totalGroupCost = 0;

        if (pushedRation && (pushedRation.payload as any)?.groups) {
            // HISTORICAL MODE: Use groups from pushedRation payload
            const payloadGroups = (pushedRation.payload as any).groups;
            Object.entries(payloadGroups).forEach(([key, gData]: [string, any]) => {
                let groupCost = 0;
                let groupVolume = 0;
                let groupMs = 0;
                const alimentData: any[] = [];
                
                const cowsCount = parseInt(gData.fed, 10) || parseInt(gData.realCount, 10) || parseInt(gData.real, 10) || 0;

                if (gData.aliments && Array.isArray(gData.aliments)) {
                    gData.aliments.forEach((aliment: any) => {
                        const foodId = parseInt(aliment.id, 10);
                        const foodRecord = getFoodData(foodId);
                        if (!foodRecord) return;

                        // v1 is the total kg of TQS for the fed animals in that group
                        const tqs = parseFloat(aliment.v1);
                        if (isNaN(tqs) || tqs <= 0) return;

                        const priceTqs = foodRecord.price_per_tqs || 0;
                        const priceMs = foodRecord.price_per_ms || 0;
                        const msPercentage = foodRecord.ms_percentage || 0;
                        
                        const ms = tqs * (msPercentage / 100);
                        const costDay = tqs * (priceTqs / 1000);

                        const alId = `${key}_${foodRecord.id}`;
                        const diffYesterday = getDiff(tqs, historyAgg.yesterdayAliment[alId] || 0, 1);
                        const diff7Days = getDiff(tqs, historyAgg.sevenDaysAliment[alId] || 0, historyAgg.sevenDaysCount);
                        const diff30Days = getDiff(tqs, historyAgg.thirtyDaysAliment[alId] || 0, historyAgg.thirtyDaysCount);

                        const diffCostYesterday = getDiff(costDay, historyAgg.yesterdayAlimentCost[alId] || 0, 1);
                        const diffCost7Days = getDiff(costDay, historyAgg.sevenDaysAlimentCost[alId] || 0, historyAgg.sevenDaysCount);
                        const diffCost30Days = getDiff(costDay, historyAgg.thirtyDaysAlimentCost[alId] || 0, historyAgg.thirtyDaysCount);

                        alimentData.push({
                            id: foodRecord.id,
                            name: foodRecord.name,
                            msPercentage,
                            humPercentage: 100 - msPercentage,
                            priceMs,
                            priceTqs,
                            kgMs: ms,
                            kgTqs: tqs,
                            costDay: costDay,
                            costYear: costDay * 365,
                            diffYesterday,
                            diff7Days,
                            diff30Days,
                            diffCostYesterday,
                            diffCost7Days,
                            diffCost30Days
                        });
                        
                        groupCost += costDay;
                        groupVolume += tqs;
                        groupMs += ms;
                    });
                }

                groups.push({
                    id: key,
                    name: gData.name,
                    cows: cowsCount,
                    totalKgTqs: groupVolume,
                    totalKgMs: groupMs,
                    totalCostDay: groupCost,
                    totalCostYear: groupCost * 365,
                    aliments: alimentData,
                    diffYesterday: getDiff(groupVolume, historyAgg.yesterdayGroup[key] || 0, 1),
                    diff7Days: getDiff(groupVolume, historyAgg.sevenDaysGroup[key] || 0, historyAgg.sevenDaysCount),
                    diff30Days: getDiff(groupVolume, historyAgg.thirtyDaysGroup[key] || 0, historyAgg.thirtyDaysCount),
                    diffCostYesterday: getDiff(groupCost, historyAgg.yesterdayGroupCost[key] || 0, 1),
                    diffCost7Days: getDiff(groupCost, historyAgg.sevenDaysGroupCost[key] || 0, historyAgg.sevenDaysCount),
                    diffCost30Days: getDiff(groupCost, historyAgg.thirtyDaysGroupCost[key] || 0, historyAgg.thirtyDaysCount)
                });
                totalGroupCost += groupCost;
            });
        } else {
            // FALLBACK: Use current DB groups if no pushedRation is found, 
            // BUT ONLY if the requested date is today or in the future.
            const todayStart = getQuebecMidnight();
            const isPast = startOfDay.getTime() < todayStart.getTime();

            if (!isPast) {
                const dbGroups = await prisma.group.findMany({
                    include: {
                        daily_servings: true
                    }
                });

            dbGroups.forEach(g => {
                let groupCost = 0;
                let groupVolume = 0;
                let groupMs = 0;
                const alimentData: any[] = [];

                g.daily_servings.forEach(ds => {
                    if (ds.is_manual) return;
                    const foodRecord = getFoodData(ds.food_id || -1);
                    if (!foodRecord) return;
                    
                    const priceTqs = foodRecord.price_per_tqs || 0;
                    const priceMs = foodRecord.price_per_ms || 0;
                    const msPercentage = foodRecord.ms_percentage;

                    const kgMsPerCow = ds.daily_kg_serving_ms;
                    const tqsPerCow = kgMsPerCow / (msPercentage / 100);
                    
                    const tqs = tqsPerCow * g.real_animal_count;
                    const ms = kgMsPerCow * g.real_animal_count;
                    
                    const costDay = tqs * (priceTqs / 1000);

                    const gKey = g.id.toString();
                    const alId = `${gKey}_${foodRecord.id}`;
                    const diffYesterday = getDiff(tqs, historyAgg.yesterdayAliment[alId] || 0, 1);
                    const diff7Days = getDiff(tqs, historyAgg.sevenDaysAliment[alId] || 0, historyAgg.sevenDaysCount);
                    const diff30Days = getDiff(tqs, historyAgg.thirtyDaysAliment[alId] || 0, historyAgg.thirtyDaysCount);

                    const diffCostYesterday = getDiff(costDay, historyAgg.yesterdayAlimentCost[alId] || 0, 1);
                    const diffCost7Days = getDiff(costDay, historyAgg.sevenDaysAlimentCost[alId] || 0, historyAgg.sevenDaysCount);
                    const diffCost30Days = getDiff(costDay, historyAgg.thirtyDaysAlimentCost[alId] || 0, historyAgg.thirtyDaysCount);

                    alimentData.push({
                        id: foodRecord.id,
                        name: foodRecord.name,
                        msPercentage,
                        humPercentage: 100 - msPercentage,
                        priceMs,
                        priceTqs,
                        kgMs: ms,
                        kgTqs: tqs,
                        costDay: costDay,
                        costYear: costDay * 365,
                        diffYesterday,
                        diff7Days,
                        diff30Days,
                        diffCostYesterday,
                        diffCost7Days,
                        diffCost30Days
                    });
                    
                    groupCost += costDay;
                    groupVolume += tqs;
                    groupMs += ms;
                });

                const gKeyOut = g.id.toString();
                groups.push({
                    id: gKeyOut,
                    name: g.name,
                    cows: g.real_animal_count,
                    totalKgTqs: groupVolume,
                    totalKgMs: groupMs,
                    totalCostDay: groupCost,
                    totalCostYear: groupCost * 365,
                    aliments: alimentData,
                    diffYesterday: getDiff(groupVolume, historyAgg.yesterdayGroup[gKeyOut] || 0, 1),
                    diff7Days: getDiff(groupVolume, historyAgg.sevenDaysGroup[gKeyOut] || 0, historyAgg.sevenDaysCount),
                    diff30Days: getDiff(groupVolume, historyAgg.thirtyDaysGroup[gKeyOut] || 0, historyAgg.thirtyDaysCount),
                    diffCostYesterday: getDiff(groupCost, historyAgg.yesterdayGroupCost[gKeyOut] || 0, 1),
                    diffCost7Days: getDiff(groupCost, historyAgg.sevenDaysGroupCost[gKeyOut] || 0, historyAgg.sevenDaysCount),
                    diffCost30Days: getDiff(groupCost, historyAgg.thirtyDaysGroupCost[gKeyOut] || 0, historyAgg.thirtyDaysCount)
                });
                totalGroupCost += groupCost;
            });
            }
        }

        const totalGroup = {
            id: 'total',
            name: 'Total',
            cows: groups.reduce((acc, g) => acc + g.cows, 0),
            totalKgTqs: groups.reduce((acc, g) => acc + g.totalKgTqs, 0),
            totalKgMs: groups.reduce((acc, g) => acc + g.totalKgMs, 0),
            totalCostDay: totalGroupCost,
            totalCostYear: totalGroupCost * 365,
            aliments: [] // We don't need aliments in the total group
        };

        // Calculate Sales Revenue for the Day
        const dailySales = await prisma.sale.findMany({
            where: {
                date_sold: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                sale_subcontracts: {
                    include: { sale_sub_contract: { include: { contract: true } } }
                }
            }
        });

        let dailySalesRevenue = 0;
        dailySales.forEach(sale => {
            if (sale.sale_subcontracts.length > 0) {
                const price = sale.sale_subcontracts[0].sale_sub_contract.contract.price_per_kg;
                dailySalesRevenue += sale.quantity_sold * price;
            }
        });

        // Calculate Annual Sales Revenue
        const annualSales = await prisma.sale.findMany({
            where: {
                date_sold: { gte: startOfYear }
            },
            include: {
                sale_subcontracts: {
                    include: { sale_sub_contract: { include: { contract: true } } }
                }
            }
        });

        let annualSalesRevenue = 0;
        annualSales.forEach(sale => {
            if (sale.sale_subcontracts.length > 0) {
                const price = sale.sale_subcontracts[0].sale_sub_contract.contract.price_per_kg;
                annualSalesRevenue += sale.quantity_sold * price;
            }
        });

        dailySummary.salesRevenue = dailySalesRevenue;
        annualBilan.salesRevenue = annualSalesRevenue;

        // Ensure we calculate exact cost per cow correctly in daily summary if groups exist
        if (groups.length > 0) {
            const totalCows = groups.reduce((acc, g) => acc + g.cows, 0);
            dailySummary.costPerCow = totalCows > 0 ? dailySummary.totalCostToday / totalCows : 0;
        }

        // Calculate Daily Graph Data (last 30 days)
        const thirtyDaysAgo = new Date(startOfDay);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        
        const thirtyDaysTransactions = await prisma.stockTransaction.findMany({
            where: {
                recorded_at: {
                    gte: thirtyDaysAgo,
                    lte: endOfDay
                },
                transaction_type: 'CONSUMPTION'
            },
            include: { food: true }
        });

        // Group by day string 'YYYY-MM-DD'
        const dailyCostsMap: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = getQuebecDateString(d);
            dailyCostsMap[dateStr] = 0;
        }

        thirtyDaysTransactions.forEach(t => {
            const dateStr = getQuebecDateString(t.recorded_at);
            if (dailyCostsMap[dateStr] !== undefined) {
                const consumedKg = Math.abs(t.quantity);
                const cost = t.financial_cost !== null 
                    ? t.financial_cost 
                    : consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
                dailyCostsMap[dateStr] += cost;
            }
        });

        const dailyGraphData = Object.keys(dailyCostsMap).sort().map(dateStr => {
            const d = new Date(dateStr + 'T12:00:00'); // avoid timezone offset issues
            return {
                date: d.toLocaleDateString('fr-CA', { timeZone: QUEBEC_TIMEZONE, day: 'numeric', month: 'short' }),
                value: dailyCostsMap[dateStr]
            };
        });

        return NextResponse.json({
            dailySummary,
            annualBilan,
            graphData,
            dailyGraphData,
            groups,
            totalGroup
        });
    } catch (error) {
        console.error('Error fetching comptabilite data:', error);
        return NextResponse.json({ error: 'Failed to fetch comptabilite data' }, { status: 500 });
    }
}
