import { prisma } from "@/app/lib/db";

export type TransactionSupplier = Awaited<ReturnType<typeof fetchFournisseurs>>[number];
export type TransactionClient = Awaited<ReturnType<typeof fetchClients>>[number];

export async function fetchFournisseurs() {
  try {
    return await prisma.supplier.findMany({
      include: {
        contracts: {
          include: {
            food: { include: { unit_type: true } },
            sub_contracts: true
          },
          orderBy: { date_end: 'desc' }
        },
        deliveries: {
          where: {
            OR: [
              { date_delivered: null },
              { date_delivered: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ]
          },
          include: {
            food: { include: { unit_type: true } },
            delivery_subcontracts: {
              include: { sub_contract: true }
            }
          },
          orderBy: { date_expected: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function fetchClients() {
  try {
    return await prisma.client.findMany({
      include: {
        contracts: {
          include: {
            food: { include: { unit_type: true } },
            sub_contracts: {
              include: {
                sale_allocations: { include: { sale: true } }
              }
            }
          },
          orderBy: { date_end: 'desc' }
        },
        sales: {
          where: {
            OR: [
              { date_sold: null },
              { date_sold: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ]
          },
          include: {
            food: { include: { unit_type: true } },
            sale_subcontracts: {
              include: {
                sale_sub_contract: { include: { contract: true } }
              }
            }
          },
          orderBy: { date_expected: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}
