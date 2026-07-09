import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const groups = await prisma.group.findMany({ select: { id: true, aliments_order: true, tour1_order: true, tour2_order: true } });
  console.log("Groups:", groups);
  const batches = await prisma.mixBatch.findMany({ select: { id: true, aliments_order: true } });
  console.log("Batches:", batches);
}
main().catch(console.error).finally(() => prisma.$disconnect());
