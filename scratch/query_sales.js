const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contracts = await prisma.saleContract.findMany({
    include: {
      sub_contracts: true
    }
  });
  console.log(JSON.stringify(contracts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
