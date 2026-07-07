import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const req = new Request('http://localhost:3000/api/ration/config');
    
    // I can't easily call the API if the server isn't running.
    // Let me just manually recreate the water calculation on DB data.
    
    const allGroupsFlat = await prisma.group.findMany({
        include: {
            daily_servings: {
                include: { food: true }
            }
        }
    });

    const tariesRef = allGroupsFlat.find(g => g.name === 'Taries normales');
    if (!tariesRef) {
        console.log("No Taries normales group");
        return;
    }
    
    let refTotalMs = 0;
    let refTotalTqs = 0;
    const baseServings = tariesRef.daily_servings.filter(ds => !ds.is_top_dress && !ds.reference_group_id);
    
    baseServings.forEach(ds => {
        if (!ds.is_manual && ds.food) {
            refTotalMs += ds.daily_kg_serving_ms;
            refTotalTqs += ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100);
            console.log("Food:", ds.food.name, "MS:", ds.daily_kg_serving_ms, "TQS:", ds.daily_kg_serving_ms / (ds.food.ms_percentage / 100));
        } else if (ds.is_manual && ds.manual_ms_percentage !== null) {
            refTotalMs += ds.daily_kg_serving_ms;
            refTotalTqs += ds.manual_qty_tqs || 0;
            console.log("Manual:", ds.manual_name, "MS:", ds.daily_kg_serving_ms, "TQS:", ds.manual_qty_tqs);
        }
    });
    
    console.log("refTotalTqs:", refTotalTqs);
    console.log("refTotalMs:", refTotalMs);
}

main().finally(() => prisma.$disconnect());
