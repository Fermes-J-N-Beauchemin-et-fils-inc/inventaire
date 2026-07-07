const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    const groups = await prisma.group.findMany({
        where: { name: { contains: 'taures' } },
        orderBy: { mix_order: 'asc' }
    });
    console.log(groups.map(g => `${g.id}: ${g.name} - ${g.mix_order}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
