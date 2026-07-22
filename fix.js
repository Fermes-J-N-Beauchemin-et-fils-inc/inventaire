const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ration = await prisma.pushedRation.findFirst({
        where: { groups_total: 532 },
        orderBy: { date: 'desc' }
    });

    if (ration) {
        const payload = ration.payload;
        let activeTour1 = [];
        let activeTour2 = [];

        if (payload.tour1Keys) {
            activeTour1 = payload.tour1Keys.filter(k => payload.groups[k] && payload.groups[k].fed > 0);
        }
        if (payload.tour2Keys) {
            activeTour2 = payload.tour2Keys.filter(k => payload.groups[k] && payload.groups[k].fed > 0);
        }
        
        const total = activeTour1.length + activeTour2.length;
        
        await prisma.pushedRation.update({
            where: { id: ration.id },
            data: { groups_total: total }
        });
        console.log(`Updated ration ${ration.id} from 532 to ${total} groups`);
    } else {
        console.log("No ration found with groups_total = 532");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
