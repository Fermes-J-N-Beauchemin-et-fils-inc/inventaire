const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const groups = await prisma.group.findMany();
  console.log("Groups:", groups);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
