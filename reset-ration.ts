import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rations = await prisma.pushedRation.findMany({
        where: { date: { gte: today } }
    });

    for (const ration of rations) {
        await prisma.pushedRation.delete({
            where: { id: ration.id }
        });
        console.log(`Deleted ration ${ration.id}`);
    }

    console.log(`Deleted ${rations.length} pushed rations for today.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
