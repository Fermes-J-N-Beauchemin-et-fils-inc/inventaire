const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deliveries = await prisma.delivery.findMany({
    where: { OR: [{ quantity_received: 500 }, { quantity_received: 0.5 }] },
    orderBy: { id: 'desc' },
    include: { food: { include: { unit_type: true } } }
  });
  console.log(JSON.stringify(deliveries.map(d => ({ id: d.id, food: d.food.name, quantity_received: d.quantity_received })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
