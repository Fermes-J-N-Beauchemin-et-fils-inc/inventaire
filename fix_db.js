const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deliveries = await prisma.delivery.findMany({
    include: { delivery_subcontracts: true }
  });
  console.log(deliveries.map(d => ({
    id: d.id,
    date_expected: d.date_expected,
    date_delivered: d.date_delivered,
    qty: d.quantity_received
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
