const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const group = await prisma.group.findFirst({
    where: { name: { contains: 'groupe 1' } },
    include: {
      daily_servings: {
        include: { food: { include: { unit_type: true } } }
      }
    }
  });

  if (!group) {
    console.log("Group not found");
    return;
  }

  let currentRtm = 0;
  let totalMs = 0;
  let totalTqs = 0;

  console.log(`Animals fed: ${group.animals_fed}`);
  console.log(`Target MS per cow: ${group.target_ms_per_cow}%`);

  for (const serving of group.daily_servings) {
    if (serving.is_manual) continue;
    const msPercentage = serving.food.ms_percentage || 100;
    const baseMsPerCow = serving.daily_kg_serving_ms;
    const baseTqsPerCow = baseMsPerCow / (msPercentage / 100);
    const v1 = Math.ceil(baseTqsPerCow * group.animals_fed);
    
    currentRtm += v1;
    totalMs += baseMsPerCow * group.animals_fed;
    totalTqs += v1;
    
    console.log(`${serving.food.name} | MS/cow: ${baseMsPerCow} | MS%: ${msPercentage}% | TQS/cow: ${baseTqsPerCow.toFixed(3)} | v1: ${v1} | RTM: ${currentRtm}`);
  }

  if (group.target_ms_per_cow) {
     const waterToAdd = (totalMs * 100 / group.target_ms_per_cow) - totalTqs;
     console.log(`\nTotal MS: ${totalMs.toFixed(2)} | Target MS%: ${group.target_ms_per_cow}%`);
     console.log(`Target Total TQS: ${(totalMs * 100 / group.target_ms_per_cow).toFixed(2)}`);
     console.log(`Current Total TQS: ${totalTqs}`);
     console.log(`Water to add: ${waterToAdd} -> ${Math.ceil(waterToAdd)}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
