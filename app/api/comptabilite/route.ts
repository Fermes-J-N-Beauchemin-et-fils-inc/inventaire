import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

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
            const cost = consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
            
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
            const cost = consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
            
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
        const allFoods = await prisma.food.findMany();
        const groups: any[] = [];
        let totalGroupCost = 0;
        
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
                const foodRecord = allFoods.find(f => f.id === ds.food_id);
                if (!foodRecord) return;
                
                const priceTqs = foodRecord.price_per_tqs || 0;
                const priceMs = foodRecord.price_per_ms || 0;
                const msPercentage = foodRecord.ms_percentage;

                const kgMsPerCow = ds.daily_kg_serving_ms;
                const tqsPerCow = kgMsPerCow / (msPercentage / 100);
                
                const tqs = tqsPerCow * g.real_animal_count;
                const ms = kgMsPerCow * g.real_animal_count;
                
                const costDay = tqs * (priceTqs / 1000);

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
                    costYear: costDay * 365
                });
                
                groupCost += costDay;
                groupVolume += tqs;
                groupMs += ms;
            });

            groups.push({
                id: `group_${g.id}`,
                name: g.name,
                cows: g.real_animal_count,
                totalKgTqs: groupVolume,
                totalKgMs: groupMs,
                totalCostDay: groupCost,
                totalCostYear: groupCost * 365,
                aliments: alimentData
            });
            totalGroupCost += groupCost;
        });

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
            const dateStr = d.toISOString().split('T')[0];
            dailyCostsMap[dateStr] = 0;
        }

        thirtyDaysTransactions.forEach(t => {
            const dateStr = t.recorded_at.toISOString().split('T')[0];
            if (dailyCostsMap[dateStr] !== undefined) {
                const consumedKg = Math.abs(t.quantity);
                const cost = consumedKg * ((t.food?.price_per_tqs || 0) / 1000);
                dailyCostsMap[dateStr] += cost;
            }
        });

        const dailyGraphData = Object.keys(dailyCostsMap).sort().map(dateStr => {
            const d = new Date(dateStr + 'T12:00:00'); // avoid timezone offset issues
            return {
                date: d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
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
