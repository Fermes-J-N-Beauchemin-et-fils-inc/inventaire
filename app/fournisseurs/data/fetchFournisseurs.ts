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
            deliveries: {
              orderBy: {
                date_expected: 'asc'
              }
            }
          },
          orderBy: {
            date_end: 'desc'
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
          food: {
            include: { unit_type: true }
          },
          deliveries: {
            orderBy: { date_expected: 'asc' }
          }
        }
      }
    }
  });
}
