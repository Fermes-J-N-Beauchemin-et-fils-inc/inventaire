const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany({
        where: {
            name: {
                contains: 'taures',
                mode: 'insensitive'
            }
        },
    });

    for (const g of groups) {
        console.log(`Group: ${g.name} | Real Cows: ${g.real_animal_count} | Fed Cows: ${g.animals_fed}`);
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
