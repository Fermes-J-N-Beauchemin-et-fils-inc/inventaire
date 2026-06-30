const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = [
    { name: "tm", ration_to_kg: 1000 },
    { name: "kg", ration_to_kg: 1 },
    { name: "g", ration_to_kg: 0.001 },
    { name: "poches", ration_to_kg: 25 },
    { name: "L", ration_to_kg: 1 }
  ];
  
  for (const unit of units) {
    const existing = await prisma.unit_type.findFirst({ where: { name: unit.name } });
    if (!existing) {
      await prisma.unit_type.create({ data: unit });
      console.log(`Created unit: ${unit.name}`);
    }
  }
  console.log("Units seeded.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
