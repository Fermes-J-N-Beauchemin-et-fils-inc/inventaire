require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching groups...");
    const groups = await prisma.group.findMany({
        where: { name: { in: ['Taries normales', 'Taures', 'Taures prével'] } },
        include: {
            daily_servings: {
                include: { food: true }
            }
        }
    });

    for (const group of groups) {
        console.log(`\n=== Group: ${group.name} ===`);
        for (const ds of group.daily_servings) {
            if (ds.is_manual) {
                console.log(`Manual: ${ds.manual_name} | MS/cow: ${ds.daily_kg_serving_ms} | TQS/cow: ${ds.manual_qty_tqs} | MS%: ${ds.manual_ms_percentage}`);
            } else if (ds.reference_group_id) {
                console.log(`Virtual Ingredient: ref_group_id ${ds.reference_group_id} | TQS/cow: ${ds.manual_qty_tqs}`);
            } else if (ds.food) {
                console.log(`Food: ${ds.food.name} | MS/cow: ${ds.daily_kg_serving_ms} | TQS/cow: ${ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100)} | MS%: ${ds.food.ms_percentage}`);
            }
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
