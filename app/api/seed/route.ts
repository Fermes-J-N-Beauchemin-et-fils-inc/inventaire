import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { mockAlimentsDetails } from '@/app/aliments/data/mockAliments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check if we already seeded to avoid duplicates
    const foodCount = await prisma.food.count();
    if (foodCount > 0) {
      return NextResponse.json({ message: "Database already seeded. Aborting to prevent duplicates." });
    }

    // 2. Insert default Unit Types
    const unitTypesData = [
      { name: "tm" },
      { name: "kg" },
      { name: "poches" }
    ];
    
    for (const unit of unitTypesData) {
      await prisma.unit_type.upsert({
        where: { name: unit.name },
        update: {},
        create: unit
      });
    }

    // 3. Insert default Storage Locations
    const storageLocationsData = [
      { name: "Silo #1 -Prémix" },
      { name: "Silo #2 -Low group" },
      { name: "Silo #3 -Amino+" },
      { name: "Silo #4 Fraîche" },
      { name: "Silo #5 -Taries" },
      { name: "Silo #6 -Maïs sec" },
      { name: "Silo #7 -Ens. Maïs" },
      { name: "Parc A" },
      { name: "Parc B" },
      { name: "Grange" },
      { name: "Réservoir principal" }
    ];

    for (const storage of storageLocationsData) {
      await prisma.storage.upsert({
        where: { name: storage.name },
        update: {},
        create: storage
      });
    }

    // 4. Fetch the inserted IDs for relationships
    const units = await prisma.unit_type.findMany();
    const storages = await prisma.storage.findMany();

    const getUnitId = (name: string) => units.find(u => u.name.toLowerCase() === name.toLowerCase())?.id || units[0].id;
    const getStorageId = (name: string) => storages.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || storages[0].id;

    // 5. Insert Foods based on mockAlimentsDetails
    for (const mockFood of mockAlimentsDetails) {
      await prisma.food.create({
        data: {
          name: mockFood.fullName,
          common_name: mockFood.commonName,
          unit_type_id: getUnitId(mockFood.unit),
          storage_id: getStorageId(mockFood.storageLocation),
          current_stock: mockFood.currentStock,
          is_active: true,
          price_per_ms: mockFood.pricePerMs || mockFood.pricePerTqs || 0,
          price_per_tqs: mockFood.pricePerTqs || 0,
          ms_percentage: mockFood.msPercentage || 100,
          daily_servings: {
            create: {
              quantity: mockFood.consumptionRate || 0
            }
          }
        }
      });
    }

    return NextResponse.json({ message: "Database successfully seeded with ingredients, units, and storage locations!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "An error occurred during seeding." }, { status: 500 });
  }
}
