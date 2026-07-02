const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting top-dress scenario seed...");

  let foods = await prisma.food.findMany({ take: 3 });
  
  if (foods.length < 3) {
    console.log("Creating dummy foods...");
    
    // Create unit type if needed
    let unit = await prisma.unit_type.findFirst();
    if (!unit) {
      unit = await prisma.unit_type.create({ data: { name: 'kg', ration_to_kg: 1 } });
    }

    // Create 3 foods
    for (let i = 1; i <= 3; i++) {
      await prisma.food.create({
        data: {
          name: `Food ${i}`,
          ms_percentage: 50,
          unit_type_id: unit.id,
          is_active: true
        }
      });
    }
    foods = await prisma.food.findMany({ take: 3 });
  }

  const [foodA, foodB, foodC] = foods;

  // 2. Create MixBatch
  const batch = await prisma.mixBatch.create({
    data: {
      name: "Mélange Démo Top Dress"
    }
  });

  // 3. Create Group 1 (Base)
  const group1 = await prisma.group.create({
    data: {
      name: "Groupe de Base (Sans Top Dress)",
      real_animal_count: 50,
      animals_fed: 50,
      performance_index: 1.0,
      mix_batch_id: batch.id,
      mix_order: 1,
      daily_servings: {
        create: [
          { food_id: foodA.id, daily_kg_serving_ms: 10 },
          { food_id: foodB.id, daily_kg_serving_ms: 8 }
        ]
      }
    }
  });

  // 4. Create Group 2 (Top Dress)
  const group2 = await prisma.group.create({
    data: {
      name: "Groupe Spécial (Avec Top Dress)",
      real_animal_count: 50,
      animals_fed: 50,
      performance_index: 1.0,
      mix_batch_id: batch.id,
      mix_order: 2,
      daily_servings: {
        create: [
          { food_id: foodA.id, daily_kg_serving_ms: 10 },
          { food_id: foodB.id, daily_kg_serving_ms: 8 },
          { food_id: foodC.id, daily_kg_serving_ms: 4 } // Top dress ingredient!
        ]
      }
    }
  });

  console.log(`Successfully created Batch: "${batch.name}"`);
  console.log(`- ${group1.name} (Feeds: ${foodA.name}, ${foodB.name})`);
  console.log(`- ${group2.name} (Feeds: ${foodA.name}, ${foodB.name}, + ${foodC.name})`);
  console.log("Go to http://localhost:3000/grains/rations to test it out!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
