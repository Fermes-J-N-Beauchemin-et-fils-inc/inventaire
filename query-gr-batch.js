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
        where: { name: { contains: 'taures GR' } },
        select: { name: true, mix_batch_id: true }
    });
    console.log(groups);
}
main().catch(console.error).finally(() => prisma.$disconnect());
