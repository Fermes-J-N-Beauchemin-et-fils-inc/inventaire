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
        console.log(`\nGroup: ${g.name} (Mix Order: ${g.mix_order}) (Animals fed: ${g.animals_fed})`);
        g.daily_servings.forEach(ds => {
            console.log(`  - Serving: ${ds.is_manual ? ds.manual_name : ds.food?.name} | Qty TQS: ${ds.manual_qty_tqs} | Ref Group: ${ds.reference_group_id}`);
        });
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
