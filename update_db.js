const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deliveries = await prisma.delivery.findMany();
  for (const d of deliveries) {
    if (d.date_delivered && d.date_expected.getTime() === d.date_delivered.getTime()) {
      await prisma.delivery.update({
        where: { id: d.id },
        data: { date_delivered: null }
      });
      console.log(`Updated delivery ${d.id}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
