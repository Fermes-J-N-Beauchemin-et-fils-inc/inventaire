const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany();

    console.log("Parcs groups:");
    for (const g of groups) {
        console.log(`- ${g.name}: real_animal_count=${g.real_animal_count}, animals_fed=${g.animals_fed}`);
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
