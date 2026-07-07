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
        include: { daily_servings: { include: { food: true } } },
        orderBy: { mix_order: 'asc' }
    });
    
    groups.forEach(g => {
        console.log(`\nGroup: ${g.name} (Mix Order: ${g.mix_order})`);
        g.daily_servings.forEach(ds => {
            console.log(`  - Serving: ${ds.food?.name} | Top Dress: ${ds.is_top_dress}`);
        });
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
