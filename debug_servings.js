const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    include: {
      daily_servings: {
        include: { food: true }
      }
    }
  });
  
  for (const g of groups) {
    console.log(`\nGroup: ${g.name} (Animals: ${g.animals_fed})`);
    for (const ds of g.daily_servings) {
      if (ds.is_manual) {
        console.log(`  Manual: ${ds.manual_name} | kgMS: ${ds.daily_kg_serving_ms} | TopDress: ${ds.is_top_dress}`);
      } else {
        console.log(`  Food: ${ds.food.name} | kgMS: ${ds.daily_kg_serving_ms} | TopDress: ${ds.is_top_dress}`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
