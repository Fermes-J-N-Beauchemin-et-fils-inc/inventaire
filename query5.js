const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const batches = await prisma.mixBatch.findMany({
        include: {
            groups: true
        }
    });

    for (const b of batches) {
        console.log(`\nBatch: ${b.name} (ID: ${b.id})`);
        let sumReal = 0;
        let sumFed = 0;
        for (const g of b.groups) {
            console.log(`  - Group ${g.name}: real=${g.real_animal_count}, fed=${g.animals_fed}`);
            sumReal += g.real_animal_count;
            sumFed += g.animals_fed;
        }
        console.log(`  TOTAL: real=${sumReal}, fed=${sumFed}`);
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
