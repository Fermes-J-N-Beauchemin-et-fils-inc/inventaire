import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch recent financial transactions for Alimentation
        const expenses = await prisma.financialTransaction.findMany({
            where: {
                category: "Alimentation",
                type: "OUT",
                date: { gte: thirtyDaysAgo }
            },
            orderBy: { date: 'asc' }
        });

        // Group expenses by day
        const expensesByDay = expenses.reduce((acc, t) => {
            const dateStr = t.date.toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        // For now, since MilkSale might be empty, we'll generate the revenueRsaData 
        // by merging the real expenses with mock revenues so the charts don't look empty.
        const revenueRsaData = Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            
            const baseRev = 3800 + Math.sin(i / 3) * 300 + Math.random() * 200;
            const revTrend = 3800 + (i * 10);
            
            // Use real expense if available, otherwise mock
            const realExpense = expensesByDay[dateStr];
            const rsaExpense = realExpense || (baseRev * 0.4 + Math.random() * 100);
            const baseRsa = baseRev - rsaExpense;
            const rsaTrend = 2280 + (i * 6);
            
            return {
                date: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
                revenu: Math.round(baseRev),
                rsa: Math.round(baseRsa),
                revenuTrend: Math.round(revTrend),
                rsaTrend: Math.round(rsaTrend),
            };
        });

        // Calculate overview metrics (mock mixed with real)
        const totalAlimCostReal = expenses.reduce((sum, t) => sum + t.amount, 0);
        const overview = {
            revenusLait: 124500,
            coutAlimentation: totalAlimCostReal > 0 ? totalAlimCostReal : 42800,
            marge: 124500 - (totalAlimCostReal > 0 ? totalAlimCostReal : 42800),
            margePercentage: ((124500 - (totalAlimCostReal > 0 ? totalAlimCostReal : 42800)) / 124500 * 100).toFixed(1),
            coutParLitre: 0.30
        };

        // We use the existing mock structure for the other charts for now as requested: "for now just put mock"
        return NextResponse.json({
            success: true,
            overview,
            charts: {
                revenueRsaData,
                // mock arrays for other charts
                troupeauData: [
                    { month: 'Jan', vachesLait: 510, taries: 55, releve: 170 },
                    { month: 'Fév', vachesLait: 512, taries: 58, releve: 172 },
                    { month: 'Mar', vachesLait: 515, taries: 52, releve: 175 },
                    { month: 'Avr', vachesLait: 518, taries: 50, releve: 178 },
                    { month: 'Mai', vachesLait: 520, taries: 54, releve: 180 },
                    { month: 'Juin', vachesLait: 525, taries: 56, releve: 181 },
                ],
                troupeauDailyData: Array.from({ length: 30 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    return {
                        date: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
                        total: 750 + Math.floor(i / 2),
                        enLait: 515 + Math.floor(i / 3),
                    };
                }),
                costBreakdownData: [
                    { name: 'En Lait (RTM)', value: 65, fill: '#3b82f6' },
                    { name: 'Relève', value: 20, fill: '#10b981' },
                    { name: 'Taries & Autres', value: 15, fill: '#f59e0b' },
                ]
            }
        });
    } catch (error) {
        console.error("Error fetching laitier comptabilite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
