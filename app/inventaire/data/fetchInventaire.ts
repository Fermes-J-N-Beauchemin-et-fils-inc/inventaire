import { prisma } from "@/app/lib/db";

export type InventoryFoodData = Awaited<ReturnType<typeof fetchInventoryFoods>>[number];
export type DeliveryData = Awaited<ReturnType<typeof fetchDeliveries>>[number];
export type SupplierWithContractsData = Awaited<ReturnType<typeof fetchSuppliersWithContracts>>[number];

export async function fetchInventoryFoods() {
  return await prisma.food.findMany({
    include: {
      unit_type: true,
      storage: true,
      daily_servings: true,
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function fetchDeliveries() {
  return await prisma.delivery.findMany({
    include: {
      food: { include: { unit_type: true } },
      contract: {
        include: { supplier: true }
      }
    },
    orderBy: {
      date_expected: 'asc'
    }
  });
}

export async function fetchSuppliersWithContracts() {
  return await prisma.supplier.findMany({
    where: { is_active: true },
    include: {
      contracts: {
        include: { food: true },
        where: {
          kg_left_to_deliver: { gt: 0 } // Only show contracts that have pending kg
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export type StorageData = Awaited<ReturnType<typeof fetchStorages>>[number];

export async function fetchStorages() {
  return await prisma.storage.findMany({
    include: {
      foods: {
        select: {
          id: true,
          name: true,
          current_stock: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}
