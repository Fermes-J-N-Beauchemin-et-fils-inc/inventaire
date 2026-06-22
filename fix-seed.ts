import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foodsData = [
    { e: 'Bunker', n: 'Ensilage de foin', cn: 'Ens.', ms: 34.0, pms: 300, ptqs: 102, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'Ensilage de maïs 2024', cn: 'Ens. Maïs #7', ms: 31.0, pms: 275, ptqs: 85, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'Ensilage de foin (2e 2024)', cn: 'EF2', ms: 31.0, pms: 275, ptqs: 85, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'EF2', cn: 'Ens. Foin #2', ms: 34.0, pms: 275, ptqs: 94, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'DDG Varennes', cn: 'Drèche sèche', ms: 89.0, pms: 358, ptqs: 319, u: 'tm', s: 5.5 },
    { e: 'Poches', n: 'Gras protégé', cn: 'Gras PALMIT', ms: 99.9, pms: 2838, ptqs: 2835, u: 'Poche (25kg)', s: 275 },
    { e: 'Poches', n: 'Gras protégé', cn: 'Gras Nurisol', ms: 99.9, pms: 2921, ptqs: 2918, u: 'Poche (25kg)', s: 19 },
    { e: 'Shed', n: 'Foin enrobé Seigle', cn: '---', ms: 35.0, pms: 714, ptqs: 250, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Paille de blé (balles) longue', cn: 'Paille silo bleu #7', ms: 86.0, pms: 256, ptqs: 220, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Paille de blé (hachée)', cn: 'Paille commodité', ms: 85.0, pms: 259, ptqs: 220, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Foin sec Vincent Coulombe', cn: 'Foin sec commodité', ms: 86.0, pms: 310, ptqs: 267, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Silo vert #8', cn: 'Ens. Silo #8', ms: 38.0, pms: 300, ptqs: 114, u: 'tm', s: 0 },
    { e: 'Enr.', n: 'Foin sec', cn: 'Foin sec', ms: 88.0, pms: 300, ptqs: 264, u: 'tm', s: 0 },
    { e: 'Tank', n: 'Lait condensé DPL', cn: 'Crème DLP', ms: 26.0, pms: 151, ptqs: 39.29, u: 'kg', s: -1982 },
    { e: 'Mini silo', n: 'Silo Maïs sec', cn: 'Silo #6 -Maïs sec', ms: 86.0, pms: 320, ptqs: 275, u: 'tm', s: 0 },
    { e: 'Silo #4', n: 'Supplément Fraîche (Vrac Gr1, CBE)', cn: 'Silo #4 Fraîche', ms: 93.0, pms: 1176, ptqs: 1094, u: 'tm', s: 1.21 },
    { e: 'Silo #1', n: 'Supplément Prémix (Vrac gr2-3, CBE)', cn: 'Silo #1 -Prémix', ms: 93.0, pms: 1256, ptqs: 1172, u: 'tm', s: 2.12 },
    { e: 'Silo #3', n: 'Amino plus', cn: 'Silo #3 -Amino+', ms: 89.0, pms: 753, ptqs: 670, u: 'tm', s: 7.12 },
    { e: 'commodité', n: 'Tourteau de soya', cn: 'Tourteau canola', ms: 87.0, pms: 426, ptqs: 371, u: 'tm', s: 13.80 },
    { e: 'Silo #2', n: 'Minéral Low group (Meal gr4-MOS-1)', cn: 'Silo #2 -Low group', ms: 93.0, pms: 1044, ptqs: 971, u: 'tm', s: 0.66 },
    { e: 'Silo #5', n: 'Supplément de transition (#505)', cn: 'Silo #5 -Taries', ms: 93.0, pms: 1718, ptqs: 1602, u: 'tm', s: 0.79 },
    { e: 'Poches', n: 'Minéral (Taures)', cn: 'Minéral Taures', ms: 98.0, pms: 1385, ptqs: 1360, u: 'Poche (20kg)', s: 20 },
    { e: 'Poches', n: 'Minéral (Vaches taries)', cn: 'Min.Tarie 17:3/2:6', ms: 98.0, pms: 1430, ptqs: 1401, u: 'Poche (20kg)', s: 0 },
    { e: 'commodité', n: 'Écaille de soya', cn: 'Écaille de soya', ms: 90.0, pms: 311, ptqs: 280, u: 'tm', s: 31.31 },
    { e: 'à terre', n: 'Son de maïs', cn: 'Criblure maïs', ms: 89.0, pms: 254, ptqs: 225, u: 'tm', s: 0 },
    { e: 'Poches', n: 'X-Zélit Vache pré-velage', cn: 'X-Zélit', ms: 93.0, pms: 5280, ptqs: 4900, u: 'Sac (20kg)', s: 30.6 },
    { e: 'Silo #4', n: 'Moulée Rumimax 22%', cn: 'Silo #8 -moulée veaux', ms: 89.0, pms: 963, ptqs: 857, u: 'tm', s: -0.02 },
    { e: 'Shed', n: 'Lait en poudre', cn: 'Lait en poudre 27-16', ms: 98.0, pms: 5077, ptqs: 4975, u: 'Poche (20kg)', s: -14.1 },
    { e: 'Bunker', n: 'Ensilage de transition', cn: '(vide)', ms: 27.0, pms: 0, ptqs: 0, u: 'tm', s: 0 },
    { e: 'commodité', n: 'Maïs rond', cn: 'Maïs rond', ms: 0, pms: 0, ptqs: 0, u: 'tm', s: 11.9 }
];

async function main() {
    await prisma.stockTransaction.deleteMany();
    await prisma.deliverySubContract.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.subContract.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.dailyServing.deleteMany();
    await prisma.foodStorage.deleteMany();
    await prisma.food.deleteMany();
    await prisma.group.deleteMany();

    const units = await prisma.unit_type.findMany();
    const getUnitId = (name: string) => {
        const u = units.find(u => u.name.toLowerCase() === name.toLowerCase());
        return u ? u.id : units[0].id;
    };

    const storages = await prisma.storage.findMany();
    const defaultStorageId = storages[0]?.id || 1;

    for (const fd of foodsData) {
        const food = await prisma.food.create({
            data: {
                name: fd.n,
                common_name: fd.cn,
                ms_percentage: fd.ms,
                price_per_ms: fd.pms,
                price_per_tqs: fd.ptqs,
                unit_type_id: getUnitId(fd.u),
                is_active: true
            }
        });

        await prisma.foodStorage.create({
            data: {
                food_id: food.id,
                storage_id: defaultStorageId,
                current_stock: fd.s
            }
        });
    }

    console.log("Foods re-seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
