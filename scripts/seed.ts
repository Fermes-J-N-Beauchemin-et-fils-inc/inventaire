import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Unit Types
  const unitTypes = [
    { name: 'tm', ration_to_kg: 1000 },
    { name: 'kg', ration_to_kg: 1 },
    { name: 'Poche (20kg)', ration_to_kg: 20 },
    { name: 'Poche (25kg)', ration_to_kg: 25 },
    { name: 'Sac (20kg)', ration_to_kg: 20 },
  ];

  const unitMap = new Map<string, number>();
  for (const ut of unitTypes) {
    const created = await prisma.unit_type.create({ data: ut });
    unitMap.set(ut.name, created.id);
  }
  console.log('Unit types created.');

  // 2. Create Storage Locations
  const storages = [
    'Bunker', 'Poches', 'Shed', 'Enr.', 'Tank', 'Mini silo',
    'Silo #4', 'Silo #1', 'Silo #3', 'commodité', 'Silo #2',
    'Silo #5', 'à terre'
  ];

  const storageMap = new Map<string, number>();
  for (const name of storages) {
    // using default max_capacity 100000
    const created = await prisma.storage.create({ data: { name, max_capacity: 100000 } });
    storageMap.set(name, created.id);
  }
  console.log('Storages created.');

  // 3. Create Dummy Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Default Supplier',
      phone_number: '555-0000',
      address: '123 Default Ave',
      email: 'default@supplier.com',
    }
  });
  console.log('Supplier created.');

  // 4. Foods data mapped from the sheets
  // We'll prepare an array and iterate
  // Map fields: entrepot, name, common_name, ms_percentage, price_per_ms, price_per_tqs, unit_name, current_stock
  const foodsData = [
    { e: 'Bunker', n: 'Ensilage de foin', cn: 'Ens.', ms: 34.0, pms: 300, ptqs: 102, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'Ensilage de maïs 2024', cn: 'Ens. Maïs #7', ms: 31.0, pms: 275, ptqs: 85, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'Ensilage de foin (2e 2024)', cn: 'EF2', ms: 31.0, pms: 275, ptqs: 85, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'EF2', cn: 'Ens. Foin #2', ms: 34.0, pms: 275, ptqs: 94, u: 'tm', s: 0 },
    { e: 'Bunker', n: 'DDG Varennes', cn: 'Drèche sèche', ms: 89.0, pms: 358, ptqs: 319, u: 'tm', s: 5.5 }, // Wait, Dreche Varennes has 5.5 tm stock
    { e: 'Poches', n: 'Gras protégé', cn: 'Gras PALMIT', ms: 99.9, pms: 2838, ptqs: 2835, u: 'Poche (25kg)', s: 275 },
    { e: 'Poches', n: 'Gras protégé', cn: 'Gras Nurisol', ms: 99.9, pms: 2921, ptqs: 2918, u: 'Poche (25kg)', s: 19 },
    { e: 'Shed', n: 'Foin enrobé Seigle', cn: '---', ms: 35.0, pms: 714, ptqs: 250, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Paille de blé (balles) longue', cn: 'Paille silo bleu #7', ms: 86.0, pms: 256, ptqs: 220, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Paille de blé (hachée)', cn: 'Paille commodité', ms: 85.0, pms: 259, ptqs: 220, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Foin sec Vincent Coulombe', cn: 'Foin sec commodité', ms: 86.0, pms: 310, ptqs: 267, u: 'tm', s: 0 },
    { e: 'Shed', n: 'Silo vert #8', cn: 'Ens. Silo #8', ms: 38.0, pms: 300, ptqs: 114, u: 'tm', s: 0 },
    { e: 'Enr.', n: 'Foin sec', cn: 'Foin sec', ms: 88.0, pms: 300, ptqs: 264, u: 'tm', s: 0 }, // common name Foin sec from img
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

  const foodMap = new Map<string, number>();

  for (const fd of foodsData) {
    const storage_id = storageMap.get(fd.e) || Array.from(storageMap.values())[0]; // fallback to first if missing
    const unit_type_id = unitMap.get(fd.u) || Array.from(unitMap.values())[0];

    const food = await prisma.food.create({
      data: {
        name: fd.n,
        common_name: fd.cn,
        ms_percentage: fd.ms,
        price_per_ms: fd.pms,
        price_per_tqs: fd.ptqs,
        current_stock: fd.s,
        storage_id: storage_id,
        unit_type_id: unit_type_id,
        is_active: true
      }
    });
    
    // Use common_name as key for later delivery mapping
    foodMap.set(fd.cn, food.id);

    // Create a dummy contract for each food (required for delivery)
    await prisma.contract.create({
      data: {
        name: `Default Contract - ${fd.n}`,
        supplier_id: supplier.id,
        food_id: food.id,
        total_kg: 100000,
        kg_left_to_deliver: 100000,
        price_per_kg: fd.ptqs / 1000,
        date_start: new Date(),
        date_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    });
  }
  console.log('Foods and Contracts created.');

  // 5. Create Deliveries
  // mapping deliveries back to food IDs
  const deliveriesData = [
    { cn: 'Silo #4 Fraîche', qty: 5, delivered: '2024-05-29', expected: '2024-06-22' }, // Livraison vrac gr1
    { cn: 'Silo #1 -Prémix', qty: 5, delivered: '2024-05-21', expected: '2024-06-22' }, // Livraison vrac gr2-3
    { cn: 'Silo #2 -Low group', qty: 5, delivered: '2024-05-21', expected: '2024-06-22' }, // Livraison vrac gr4
    { cn: 'Tourteau canola', qty: 9, delivered: '2024-05-26', expected: '2024-06-26' }, // Livraison t. Canola
    { cn: 'Crème DLP', qty: -3, delivered: '2024-05-23', expected: '2024-06-14' }, // DLP
    { cn: 'Silo #3 -Amino+', qty: 14, delivered: '2024-05-27', expected: '2024-07-01' }, // Amino+
    { cn: 'Maïs rond', qty: 11, delivered: '2024-04-29', expected: '2024-06-28' }, // Maïs rond
    { cn: 'Silo #8 -moulée veaux', qty: -3, delivered: '2024-05-19', expected: '2024-06-14' }, // Silo #8 -moulée veaux
  ];

  for (const del of deliveriesData) {
    const foodId = foodMap.get(del.cn);
    if (!foodId) {
      console.warn(`Food not found for delivery: ${del.cn}`);
      continue;
    }
    
    // Find contract
    const contract = await prisma.contract.findFirst({ where: { food_id: foodId } });
    if (!contract) continue;

    await prisma.delivery.create({
      data: {
        contract_id: contract.id,
        food_id: foodId,
        quantity_received: del.qty,
        date_delivered: new Date(del.delivered),
        date_expected: new Date(del.expected)
      }
    });
  }

  console.log('Deliveries created. Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
