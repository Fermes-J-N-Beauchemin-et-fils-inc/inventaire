import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting group seed...');

  const groupsData = [
    {
      name: 'Ration groupe 1', count: 48, fed: 48,
      rations: [
        { cn: 'Silo #6 -Maïs sec', qty: 2.500 },
        { cn: 'Silo #4 Fraîche', qty: 2.500 },
        { cn: 'Silo #3 -Amino+', qty: 1.400 },
        { cn: 'Tourteau canola', qty: 2.800 },
        { cn: 'Écaille de soya', qty: 2.000 },
        { cn: 'Crème DLP', qty: 1.100 },
        { cn: 'Ens. Foin #2', qty: 3.000 },
        { cn: 'Ens. Maïs #7', qty: 11.200 },
        { cn: 'Gras Nurisol', qty: 0.200 },
        { cn: 'Paille silo bleu #7', qty: 0.300 },
      ]
    },
    {
      name: 'Ration groupe 2', count: 100, fed: 99,
      rations: [
        { cn: 'Silo #6 -Maïs sec', qty: 3.200 },
        { cn: 'Silo #1 -Prémix', qty: 2.000 },
        { cn: 'Silo #3 -Amino+', qty: 1.000 },
        { cn: 'Tourteau canola', qty: 3.800 },
        { cn: 'Écaille de soya', qty: 1.200 },
        { cn: 'Crème DLP', qty: 1.500 },
        { cn: 'Ens. Foin #2', qty: 4.600 },
        { cn: 'Ens. Maïs #7', qty: 15.000 },
        { cn: 'Drèche sèche', qty: 1.600 },
        { cn: 'Gras Nurisol', qty: 0.150 },
      ]
    },
    {
      name: 'Ration groupe 3', count: 77, fed: 77,
      rations: [
        { cn: 'Silo #6 -Maïs sec', qty: 2.600 },
        { cn: 'Silo #1 -Prémix', qty: 1.600 },
        { cn: 'Silo #3 -Amino+', qty: 0.800 },
        { cn: 'Tourteau canola', qty: 2.800 },
        { cn: 'Écaille de soya', qty: 0.500 },
        { cn: 'Crème DLP', qty: 1.200 },
        { cn: 'Ens. Foin #2', qty: 3.500 },
        { cn: 'Ens. Maïs #7', qty: 12.500 },
        { cn: 'Drèche sèche', qty: 1.800 },
      ]
    },
    {
      name: 'Ration groupe 4', count: 61, fed: 61,
      rations: [
        { cn: 'Silo #2 -Low group', qty: 1.200 },
        { cn: 'Silo #6 -Maïs sec', qty: 3.300 },
        { cn: 'Silo #3 -Amino+', qty: 0.500 },
        { cn: 'Tourteau canola', qty: 2.700 },
        { cn: 'Écaille de soya', qty: 0.500 },
        { cn: 'Crème DLP', qty: 1.400 },
        { cn: 'Ens. Foin #2', qty: 6.000 },
        { cn: 'Ens. Maïs #7', qty: 12.600 },
        { cn: 'Drèche sèche', qty: 2.800 },
      ]
    },
    {
      name: 'Ration Taures Gr 4', count: 16, fed: 16,
      rations: [
        { cn: 'Foin sec commodité', qty: 1.500 },
        { cn: 'Ens. Foin #2', qty: 4.000 },
        { cn: 'Ens. Maïs #7', qty: 2.000 },
        { cn: 'Minéral Taures', qty: 0.170 },
        { cn: 'Tourteau canola', qty: 1.500 },
      ]
    },
    {
      name: 'Ration Taures Gr 3', count: 14, fed: 14,
      rations: [
        { cn: 'Foin sec commodité', qty: 1.390 },
        { cn: 'Ens. Foin #2', qty: 3.708 },
        { cn: 'Ens. Maïs #7', qty: 1.854 },
        { cn: 'Minéral Taures', qty: 0.158 },
        { cn: 'Tourteau canola', qty: 1.390 },
      ]
    },
    {
      name: 'Ration Taures Gr 2', count: 12, fed: 12,
      rations: [
        { cn: 'Foin sec commodité', qty: 1.309 },
        { cn: 'Ens. Foin #2', qty: 3.490 },
        { cn: 'Ens. Maïs #7', qty: 1.745 },
        { cn: 'Minéral Taures', qty: 0.148 },
        { cn: 'Tourteau canola', qty: 1.309 },
      ]
    },
    {
      name: 'Ration Taures Gr 1', count: 12, fed: 12,
      rations: [
        { cn: 'Foin sec commodité', qty: 1.145 },
        { cn: 'Ens. Foin #2', qty: 3.053 },
        { cn: 'Ens. Maïs #7', qty: 1.527 },
        { cn: 'Minéral Taures', qty: 0.130 },
        { cn: 'Tourteau canola', qty: 1.145 },
      ]
    },
    {
      name: 'Ration Taries normales', count: 33, fed: 33,
      rations: [
        { cn: 'Paille silo bleu #7', qty: 5.200 },
        { cn: 'Ens. Maïs #7', qty: 7.800 },
        { cn: 'Silo #3 -Amino+', qty: 1.600 },
        { cn: 'Silo #5 -Taries', qty: 1.100 },
      ]
    }
  ];

  // Fetch all foods to map common_name to id
  const foods = await prisma.food.findMany();
  const foodMap = new Map<string, number>();
  
  for (const f of foods) {
    if (f.common_name) {
      foodMap.set(f.common_name, f.id);
    }
  }

  for (const gd of groupsData) {
    // Create the group
    const group = await prisma.group.create({
      data: {
        name: gd.name,
        real_animal_count: gd.count,
        animals_fed: gd.fed,
        performance_index: 1.0 // Default as discussed
      }
    });

    console.log(`Created group: ${group.name} (ID: ${group.id})`);

    // Create daily servings
    for (const ration of gd.rations) {
      if (ration.qty === 0) continue; // Skip zero quantities just in case

      let foodId = foodMap.get(ration.cn);
      
      if (!foodId) {
        console.warn(`Warning: Food with common_name '${ration.cn}' not found. Looking for close matches...`);
        // Basic fallback search if needed
        const fallback = foods.find(f => f.name.includes(ration.cn) || (f.common_name && f.common_name.includes(ration.cn)));
        if (fallback) {
          foodId = fallback.id;
        } else {
          console.error(`Error: Could not find food for '${ration.cn}' in ${gd.name}. Skipping this ration.`);
          continue;
        }
      }

      await prisma.dailyServing.create({
        data: {
          food_id: foodId,
          group_id: group.id,
          daily_kg_serving_ms: ration.qty
        }
      });
    }
  }

  console.log('Group seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
