const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 1; // Assuming we want to delete aliment 1 or find an existing one
  const food = await prisma.food.findFirst();
  if (!food) return console.log("no food");
  console.log("Trying to delete food ID:", food.id);
  
  try {
    await prisma.$transaction([
      prisma.dailyServing.deleteMany({ where: { food_id: food.id } }),
      prisma.stockTransaction.deleteMany({ where: { food_id: food.id } }),
      prisma.delivery.deleteMany({ where: { food_id: food.id } }),
      prisma.sale.deleteMany({ where: { food_id: food.id } }),
      prisma.contract.deleteMany({ where: { food_id: food.id } }),
      prisma.saleContract.deleteMany({ where: { food_id: food.id } }),
      // add these just in case:
      prisma.foodStorage.deleteMany({ where: { food_id: food.id } }),
      prisma.foodSnapshot.deleteMany({ where: { food_id: food.id } }),
      prisma.food.delete({ where: { id: food.id } })
    ]);
    console.log("Deleted successfully");
  } catch(e) {
    console.error("Error:", e);
  }
}
main();
