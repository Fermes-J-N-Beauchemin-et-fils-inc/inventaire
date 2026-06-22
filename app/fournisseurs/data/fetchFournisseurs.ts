import { prisma } from "@/app/lib/db";

export type SupplierWithDetails = Awaited<ReturnType<typeof fetchFournisseurs>>[number];

export async function fetchFournisseurs() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        contracts: {
          include: {
            food: {
              include: {
                unit_type: true
              }
            },
            sub_contracts: true
          },
          orderBy: {
            date_end: 'desc'
          }
        },
        deliveries: {
          where: {
            OR: [
              { date_delivered: null },
              { date_delivered: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ]
          },
          include: {
            food: true,
            delivery_subcontracts: {
              include: { sub_contract: true }
            }
          },
          orderBy: {
            date_expected: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

// Helper to fetch single supplier
export async function fetchSupplier(id: number) {
  return await prisma.supplier.findUnique({
    where: { id },
    include: {
      contracts: {
        include: {
          food: { include: { unit_type: true } },
          sub_contracts: true
        }
      },
      deliveries: {
        where: {
          OR: [
            { date_delivered: null },
            { date_delivered: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
          ]
        },
        include: {
          food: true,
          delivery_subcontracts: { include: { sub_contract: true } }
        },
        orderBy: { date_expected: 'asc' }
      }
    }
  });
}
