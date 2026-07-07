const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    console.log("Starting DB fixes for Taries...");

    // 1. taries normales (lowercase t)
    const taries = await prisma.group.findFirst({
        where: { name: 'taries normales' },
        include: { daily_servings: { include: { food: true } } }
    });
    if (taries) {
        for (const ds of taries.daily_servings) {
            if (ds.food && ds.food.name === 'Silor#3 -Amino+') {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { is_top_dress: false }
                });
                console.log("Updated taries normales: Amino+ is now Base Mix (not Top Dress)");
            }
            if (ds.food && ds.food.name === 'Silo #5 -Taries') {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { daily_kg_serving_ms: 1.100 }
                });
                console.log("Updated taries normales: Silo #5 is now 1.100 kg MS");
            }
        }
    } else {
        console.log("taries normales not found!");
    }

    console.log("All DB fixes applied successfully!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
