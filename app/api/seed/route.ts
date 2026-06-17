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
      { name: "tm", ration_to_kg: 1000 },
      { name: "kg", ration_to_kg: 1 },
      { name: "poches", ration_to_kg: 25 }
    ];
    
    for (const unit of unitTypesData) {
      const existing = await prisma.unit_type.findFirst({ where: { name: unit.name } });
      if (!existing) {
        await prisma.unit_type.create({ data: unit });
      }
    }

    // 3. Insert default Storage Locations
    const storageLocationsData = [
      { name: "Silo #1 -Prémix", max_capacity: 50000 },
      { name: "Silo #2 -Low group", max_capacity: 50000 },
      { name: "Silo #3 -Amino+", max_capacity: 50000 },
      { name: "Silo #4 Fraîche", max_capacity: 50000 },
      { name: "Silo #5 -Taries", max_capacity: 50000 },
      { name: "Silo #6 -Maïs sec", max_capacity: 50000 },
      { name: "Silo #7 -Ens. Maïs", max_capacity: 50000 },
      { name: "Parc A", max_capacity: 10000 },
      { name: "Parc B", max_capacity: 10000 },
      { name: "Grange", max_capacity: 200000 },
      { name: "Réservoir principal", max_capacity: 100000 }
    ];

    for (const storage of storageLocationsData) {
      const existing = await prisma.storage.findFirst({ where: { name: storage.name } });
      if (!existing) {
        await prisma.storage.create({ data: storage });
      }
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
          ms_percentage: mockFood.msPercentage || 100
        }
      });
    }

    return NextResponse.json({ message: "Database successfully seeded with ingredients, units, and storage locations!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "An error occurred during seeding." }, { status: 500 });
  }
}
