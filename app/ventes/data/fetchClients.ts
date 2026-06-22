import { prisma } from "@/app/lib/db";

export async function fetchClients() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        contracts: {
          include: {
            food: true,
            sub_contracts: {
              include: {
                sale_allocations: {
                  include: {
                    sale: true
                  }
                }
              }
            }
          }
        },
        sales: {
          include: {
            food: {
              include: {
                unit_type: true
              }
            },
            sale_subcontracts: {
              include: {
                sale_sub_contract: {
                  include: {
                    contract: true
                  }
                }
              }
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

    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return [];
  }
}
