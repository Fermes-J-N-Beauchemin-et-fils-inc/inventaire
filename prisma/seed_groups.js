const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groupsToCreate = [
    { name: 'Vaches en Lait (Parc 1)', real_animal_count: 100, animals_fed: 102, performance_index: 1.0, season: 'hiver' },
    { name: 'Vaches en Lait (Parc 2)', real_animal_count: 120, animals_fed: 122, performance_index: 1.0, season: 'hiver' },
    { name: 'Taries', real_animal_count: 30, animals_fed: 32, performance_index: 1.0, season: 'hiver' },
    { name: 'Relève (Génisses)', real_animal_count: 50, animals_fed: 52, performance_index: 1.0, season: 'hiver' },
  ];

  for (const g of groupsToCreate) {
    await prisma.group.create({ data: g });
  }

  console.log('Groups seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
