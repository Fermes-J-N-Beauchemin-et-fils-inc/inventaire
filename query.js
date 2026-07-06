const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany({
        include: {
            daily_servings: {
                include: {
                    food: true
                }
            }
        }
    });

    for (const g of groups) {
        console.log(`Group: ${g.name} | Real Cows: ${g.real_animal_count} | Fed Cows: ${g.animals_fed} | Season: ${g.season} | Indice: ${g.performance_index}`);
        for (const s of g.daily_servings) {
            console.log(`  - Food: ${s.food.name} | kg MS/cow: ${s.daily_kg_serving_ms} | MS%: ${s.food.ms_percentage}%`);
        }
    }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
