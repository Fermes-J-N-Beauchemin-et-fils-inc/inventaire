import { prisma } from "@/app/lib/db";

export type InventoryFoodData = Awaited<ReturnType<typeof fetchInventoryFoods>>[number];
export type DeliveryData = Awaited<ReturnType<typeof fetchDeliveries>>[number];
export type SupplierWithContractsData = Awaited<ReturnType<typeof fetchSuppliersWithContracts>>[number];

export async function fetchInventoryFoods() {
  return await prisma.food.findMany({
    include: {
      unit_type: true,
      storages: { include: { storage: true } },
      daily_servings: {
        include: { group: true }
      },
      sale_contracts: {
        where: { is_active: true },
        include: {
          sub_contracts: {
            where: { kg_left_to_deliver: { gt: 0 } }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function fetchDeliveries() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return await prisma.delivery.findMany({
    where: {
      OR: [
        { date_delivered: null },
        { date_delivered: { gte: thirtyDaysAgo } }
      ]
    },
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

export type ClientWithContractsData = Awaited<ReturnType<typeof fetchClientsWithContracts>>[number];

export async function fetchClientsWithContracts() {
  return await prisma.client.findMany({
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
              unit_type: true,
              sale_contracts: {
                where: { is_active: true },
                include: {
                  sub_contracts: {
                    where: { kg_left_to_deliver: { gt: 0 } }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}
