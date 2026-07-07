const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    await prisma.group.update({ where: { id: 11 }, data: { mix_order: 0 } });
    await prisma.group.update({ where: { id: 10 }, data: { mix_order: 1 } });
    await prisma.group.update({ where: { id: 9 }, data: { mix_order: 2 } });
    await prisma.group.update({ where: { id: 8 }, data: { mix_order: 3 } });
    console.log('Updated mix order for GR 1-4');
}
main().catch(console.error).finally(() => prisma.$disconnect());
