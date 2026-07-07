const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:HyjpMUfUoatpXQKHLEjIWPvdAfwBpYJU@maglev.proxy.rlwy.net:58739/railway"
    }
  }
});

async function main() {
    console.log("Clearing PushedRation cache...");
    await prisma.pushedRation.deleteMany({});
    console.log("Cache cleared!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
