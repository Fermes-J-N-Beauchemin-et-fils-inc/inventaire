require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const allGroupsFlat = await prisma.group.findMany({
        include: {
            daily_servings: {
                include: { food: true }
            }
        }
    });

    const groups = allGroupsFlat.filter(g => g.name === 'Taures prével');
    const group = groups[0];
    if (!group) return console.log("Group not found");
    
    let totalMs = 0;
    let totalTqs = 0;
    const needs = {};

    group.daily_servings.forEach((serving) => {
        if (serving.reference_group_id) {
            const refGroup = allGroupsFlat.find(g => g.id === serving.reference_group_id);
            if (refGroup) {
                let refTotalMs = 0;
                let refTotalTqs = 0;
                const baseServings = refGroup.daily_servings.filter((ds) => !ds.is_top_dress && !ds.reference_group_id);
                baseServings.forEach((ds) => {
                    if (!ds.is_manual && ds.food) {
                        refTotalMs += ds.daily_kg_serving_ms;
                        refTotalTqs += ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100);
                    } else if (ds.is_manual && ds.manual_ms_percentage !== null) {
                        refTotalMs += ds.daily_kg_serving_ms;
                        refTotalTqs += ds.manual_qty_tqs || 0;
                    }
                });
                
                const targetTqsForWholeGroup = serving.manual_qty_tqs ? serving.manual_qty_tqs * group.animals_fed : 0;
                console.log("refTotalTqs (calculated with new logic):", refTotalTqs);
                console.log("targetTqsForWholeGroup:", targetTqsForWholeGroup);
                
                if (refTotalTqs > 0) {
                    baseServings.forEach((ds) => {
                        if (!ds.is_manual && ds.food) {
                            const originalTqs = ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100);
                            const proportion = originalTqs / refTotalTqs;
                            
                            const proportionalTqs = targetTqsForWholeGroup * proportion;
                            const proportionalMs = proportionalTqs * (ds.food.ms_percentage / 100);
                            
                            totalMs += proportionalMs;
                            totalTqs += proportionalTqs;
                            
                            const key = ds.food.name;
                            if (!needs[key]) {
                                needs[key] = { tqs: 0, ms: 0 };
                            }
                            needs[key].tqs += proportionalTqs;
                            needs[key].ms += proportionalMs;
                        } else if (ds.is_manual) {
                            const originalTqs = ds.manual_qty_tqs || 0;
                            const proportion = originalTqs / refTotalTqs;
                            
                            const proportionalTqs = targetTqsForWholeGroup * proportion;
                            const proportionalMs = proportionalTqs * ((ds.manual_ms_percentage || 0) / 100);
                            
                            totalMs += proportionalMs;
                            totalTqs += proportionalTqs;
                            
                            const key = ds.manual_name || "Manuel";
                            if (!needs[key]) {
                                needs[key] = { tqs: 0, ms: 0 };
                            }
                            needs[key].tqs += proportionalTqs;
                            needs[key].ms += proportionalMs;
                        }
                    });
                }
            }
        }
    });

    console.log("Taures virtual needs:");
    console.log(JSON.stringify(needs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
