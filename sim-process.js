const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    const allGroupsFlat = await prisma.group.findMany({
        include: { daily_servings: { include: { food: true } } }
    });

    const batch = await prisma.mixBatch.findUnique({
        where: { id: 2 },
        include: {
            groups: {
                orderBy: { mix_order: 'asc' },
                include: { daily_servings: { include: { food: true } } }
            }
        }
    });

    const groups = batch.groups;
    const groupNeeds = groups.map(group => {
        const needs = {};
        let totalMs = 0; let totalTqs = 0;
        group.daily_servings.forEach(serving => {
            if (serving.food) {
                const msPercentage = serving.food.ms_percentage || 100;
                const baseMsPerCow = serving.daily_kg_serving_ms;
                const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
                const tqs = baseTqsPerCow * group.animals_fed;
                const ms = baseMsPerCow * group.animals_fed;
                totalMs += ms; totalTqs += tqs;
                
                const key = serving.is_top_dress ? `${serving.food.id}_topdress` : serving.food.id.toString();
                if (!needs[key]) needs[key] = { food: serving.food, tqs: 0, ms: 0, isManual: false };
                needs[key].tqs += tqs;
                needs[key].ms += ms;
            }
        });
        return { group, needs };
    });

    const globalNeeds = {};
    groupNeeds.forEach(({ needs }) => {
        Object.entries(needs).forEach(([key, data]) => {
            globalNeeds[key] = (globalNeeds[key] || 0) + data.tqs;
        });
    });

    const sequence = [];
    let currentRtm = 0;
    const loadedIngredients = new Set();
    groupNeeds.forEach(({ group, needs }) => {
        Object.entries(needs).forEach(([key, data]) => {
            if (!loadedIngredients.has(key)) {
                loadedIngredients.add(key);
                const amountToLoad = Math.round(globalNeeds[key]);
                currentRtm += amountToLoad;
                sequence.push({ id: key, name: data.food.name, loadAmount: amountToLoad, currentRtm });
            }
        });
        const amountToDump = Math.round(Object.values(needs).reduce((sum, data) => sum + data.tqs, 0));
        currentRtm -= amountToDump;
        const targetRtm = Math.max(0, currentRtm);
        sequence.push({ id: `dump_${group.id}`, name: `Vider au ${group.name}`, amountToDump, targetRtm });
    });

    console.log(JSON.stringify(sequence, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
