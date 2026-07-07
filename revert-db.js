const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    console.log("Starting DB rollback...");

    // 1. taries normales
    const taries = await prisma.group.findFirst({
        where: { name: 'taries normales' },
        include: { daily_servings: { include: { food: true } } }
    });
    if (taries) {
        for (const ds of taries.daily_servings) {
            if (ds.food && ds.food.name === 'Silor#3 -Amino+') {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { is_top_dress: true }
                });
                console.log("Reverted taries normales: Amino+ is now Top Dress again");
            }
            if (ds.food && ds.food.name === 'Silo #5 -Taries') {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { daily_kg_serving_ms: 1.200 }
                });
                console.log("Reverted taries normales: Silo #5 is now 1.200 kg MS again");
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
            data: { animals_fed: 20 }
        });
        console.log("Reverted taures prével: Animals fed is now 20 again");

        for (const ds of tauresPrevel.daily_servings) {
            if (ds.food) {
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: { is_top_dress: false }
                });
                console.log(`Reverted taures prével: ${ds.food.name} is now Base Mix again`);
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
                let dataToUpdate = { is_top_dress: false };
                
                if (ds.food.name === 'Silo#6 - Mais sec') {
                    dataToUpdate.daily_kg_serving_ms = 0.630;
                } else if (ds.food.name === 'Silor#3 -Amino+') {
                    dataToUpdate.daily_kg_serving_ms = 0.720;
                }
                
                await prisma.dailyServing.update({
                    where: { id: ds.id },
                    data: dataToUpdate
                });
                console.log(`Reverted pré-velage: ${ds.food.name} is now Base Mix again (and quantities reverted)`);
            }
        }
    }

    console.log("All DB rollbacks applied successfully!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
