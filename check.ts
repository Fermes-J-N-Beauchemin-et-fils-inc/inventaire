import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const dateParam = "2026-06-18";
    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);

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
    console.log("Found transactions:", dailyTransactions.length);

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

    console.log("Found pushed ration:", !!pushedRation);

    let totalDailyCost = 0;
    dailyTransactions.forEach(t => {
        const consumedKg = Math.abs(t.quantity);
        const cost = consumedKg * (t.food?.price_per_tqs || 0);
        totalDailyCost += cost;
    });
    console.log("Total cost:", totalDailyCost);

    let totalGroupCost = 0;
    if (pushedRation && pushedRation.payload) {
        const payload: any = pushedRation.payload;
        Object.keys(payload).forEach(key => {
            const g = payload[key];
            g.aliments?.forEach((a: any) => {
                const foodRecord = dailyTransactions.find(t => t.food_id.toString() === a.id)?.food;
                if (!foodRecord) {
                    console.log("Could not find foodRecord for aliment ID:", a.id);
                }
            });
        });
    }

}
main().catch(console.error).finally(() => prisma.$disconnect());
