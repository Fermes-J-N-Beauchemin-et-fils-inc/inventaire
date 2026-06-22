import { prisma } from "@/app/lib/db";

export type InventoryFoodData = Awaited<ReturnType<typeof fetchInventoryFoods>>[number];
export type DeliveryData = Awaited<ReturnType<typeof fetchDeliveries>>[number];
export type SupplierWithContractsData = Awaited<ReturnType<typeof fetchSuppliersWithContracts>>[number];

export async function fetchInventoryFoods() {
  return await prisma.food.findMany({
    include: {
      unit_type: true,
      storages: { include: { storage: true } },
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
      supplier: true,
      delivery_subcontracts: {
        include: {
          sub_contract: {
            include: { contract: true }
          }
        }
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
        include: { 
          food: true,
          sub_contracts: true
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
      food_storages: {
        include: {
          food: {
            include: {
              unit_type: true
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}
