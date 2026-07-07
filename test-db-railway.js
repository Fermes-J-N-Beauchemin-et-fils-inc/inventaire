const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    console.log("Fetching groups...");
    const groups = await prisma.group.findMany({
        where: { name: { in: ['Taries normales', 'Taures', 'Taures prével', 'Pré-vêlage'] } },
        include: {
            daily_servings: {
                include: { food: true }
            }
        }
    });

    for (const group of groups) {
        console.log(`\n=== Group: ${group.name} ===`);
        console.log(`Target MS per cow: ${group.target_ms_per_cow}`);
        console.log(`Animals fed: ${group.animals_fed}`);
        for (const ds of group.daily_servings) {
            if (ds.is_manual) {
                console.log(`[${ds.is_top_dress ? 'TOP DRESS' : 'BASE'}] Manual: ${ds.manual_name} | MS/cow: ${ds.daily_kg_serving_ms.toFixed(3)} | TQS/cow: ${ds.manual_qty_tqs} | MS%: ${ds.manual_ms_percentage}`);
            } else if (ds.reference_group_id) {
                console.log(`[${ds.is_top_dress ? 'TOP DRESS' : 'BASE'}] Virtual: ref_group_id ${ds.reference_group_id} | Target TQS/cow: ${ds.manual_qty_tqs}`);
            } else if (ds.food) {
                const msPercent = ds.food.ms_percentage;
                const tqs = ds.daily_kg_serving_ms / (msPercent / 100);
                console.log(`[${ds.is_top_dress ? 'TOP DRESS' : 'BASE'}] Food: ${ds.food.name} | MS/cow: ${ds.daily_kg_serving_ms.toFixed(3)} | TQS/cow: ${tqs.toFixed(3)} | MS%: ${msPercent}`);
            }
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
