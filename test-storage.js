const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const storages = await prisma.storage.findMany();
  console.log(storages);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
