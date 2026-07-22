const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    console.log("Starting DB fixes...");

    // 1. Taries normales
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
                console.log("Updated Taries normales: Amino+ is now Base Mix (not Top Dress)");
            }
            if (ds.food && ds.food.name === 'Silo #5 -Taries') {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { daily_kg_serving_ms: 1.100 }
                });
                console.log("Updated Taries normales: Silo #5 is now 1.100 kg MS");
            }
        }
    }

    // 2. taures prével
    const tauresPrevel = await prisma.group.findFirst({
        where: { name: 'taures prével' },
        include: { daily_servings: { include: { food: true } } }
    });
    if (tauresPrevel) {
        await prisma.group.update({
            where: { id: tauresPrevel.id },
            data: { animals_fed: 17 }
        });
        console.log("Updated taures prével: Animals fed is now 17");

        for (const ds of tauresPrevel.daily_servings) {
            if (ds.food) {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { is_top_dress: true }
                });
                console.log("udpate top dress for the taures")
                console.log(`Updated taures prével: ${ds.food.name} is now Top Dress`);
            }
        }
    }

    // 3. pré-velage
    const preVelage = await prisma.group.findFirst({
        where: { name: 'pré-velage' },
        include: { daily_servings: { include: { food: true } } }
    });
    if (preVelage) {
        for (const ds of preVelage.daily_servings) {
            if (ds.food) {
                let dataToUpdate = { is_top_dress: true };
                
                if (ds.food.name === 'Silo#6 - Mais sec') {
                    dataToUpdate.daily_kg_serving_ms = 0.600;
                } else if (ds.food.name === 'Silor#3 -Amino+') {
                    dataToUpdate.daily_kg_serving_ms = 0.700;
                }
                
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: dataToUpdate
                });
                console.log(`Updated pré-velage: ${ds.food.name} is now Top Dress (and quantities adjusted if needed)`);
            }
        }
    }

    console.log("All DB fixes applied successfully!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
