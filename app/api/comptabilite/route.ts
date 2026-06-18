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
            foinSecNourrisKg: foinSecVolume
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
            averageCostPerDay: annualTotalCost / Math.max(1, Math.ceil((new Date().getTime() - startOfYear.getTime()) / (1000 * 3600 * 24)))
        };

        // Parse groups from pushedRation payload for the GroupsDataView
        const groups: any[] = [];
        let totalGroupCost = 0;
        
        if (pushedRation && pushedRation.payload) {
            const payload: any = pushedRation.payload;
            Object.keys(payload).forEach(key => {
                const g = payload[key];
                let groupCost = 0;
                let groupVolume = 0;
                let groupMs = 0;
                const alimentData: any[] = [];

                g.aliments?.forEach((a: any) => {
                    const tqs = parseFloat(a.v2) || 0;
                    const ms = parseFloat(a.v1) || 0;
                    // Since payload might not have price, we find it from dailyTransactions or foods
                    const foodRecord = dailyTransactions.find(t => t.food_id.toString() === a.id)?.food;
                    const priceTqs = foodRecord ? (foodRecord.price_per_tqs || 0) : 0;
                    const priceMs = foodRecord ? (foodRecord.price_per_ms || 0) : 0;
                    const msPercentage = foodRecord ? foodRecord.ms_percentage : 100;
                    
                    const costDay = tqs * (priceTqs / 1000);
                    
                    alimentData.push({
                        id: a.id,
                        name: a.name,
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
                    id: key,
                    name: g.name,
                    cows: g.fed,
                    totalKgTqs: groupVolume,
                    totalKgMs: groupMs,
                    totalCostDay: groupCost,
                    totalCostYear: groupCost * 365,
                    aliments: alimentData
                });
                totalGroupCost += groupCost;
            });
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

        // Ensure we calculate exact cost per cow correctly in daily summary if groups exist
        if (groups.length > 0) {
            const totalCows = groups.reduce((acc, g) => acc + g.cows, 0);
            dailySummary.costPerCow = totalCows > 0 ? dailySummary.totalCostToday / totalCows : 0;
        }

        return NextResponse.json({
            dailySummary,
            annualBilan,
            graphData,
            groups,
            totalGroup
        });
    } catch (error) {
        console.error('Error fetching comptabilite data:', error);
        return NextResponse.json({ error: 'Failed to fetch comptabilite data' }, { status: 500 });
    }
}
