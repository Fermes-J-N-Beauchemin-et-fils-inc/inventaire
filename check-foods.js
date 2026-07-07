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
        include: {
            daily_servings: {
                include: { food: true }
            }
        },
        orderBy: { mix_order: 'asc' }
    });
    groups.forEach(g => {
        console.log(`Group: ${g.name} (Mix Order: ${g.mix_order})`);
        g.daily_servings.forEach(s => {
            console.log(`  - Serving: ${s.food.name} | Food ID: ${s.food.id} | Qty TQS: ${s.daily_kg_serving_tqs}`);
        });
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
