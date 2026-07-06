const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const batches = await prisma.mixBatch.findMany({
        include: {
            groups: {
                include: {
                    daily_servings: {
                        include: { food: true }
                    }
                },
                orderBy: { mix_order: 'asc' }
            }
        }
    });

    for (const batch of batches) {
        console.log("Batch Name:", batch.name);
        const totalAnimalsFedForBatch = batch.groups.reduce((sum, g) => sum + g.animals_fed, 0);
        console.log("Total animals fed:", totalAnimalsFedForBatch);
        
        for (const g of batch.groups) {
            console.log(`- Group ${g.name}: ${g.animals_fed} cows`);
        }
        
        const globalNeeds = {};
        for (const group of batch.groups) {
            for (const serving of group.daily_servings) {
                if (serving.food) {
                    const msPercentage = serving.food.ms_percentage || 100;
                    const baseMsPerCow = serving.daily_kg_serving_ms;
                    const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
                    const tqs = baseTqsPerCow * group.animals_fed;
                    globalNeeds[serving.food.name] = (globalNeeds[serving.food.name] || 0) + tqs;
                }
            }
        }
        console.log("Global Needs:", globalNeeds);
    }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
