const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const foods = await prisma.food.findMany({ select: { name: true, price_per_ms: true, price_per_tqs: true, ms_percentage: true }});
  console.log(foods.slice(0, 5));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
