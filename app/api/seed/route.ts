import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { mockAlimentsDetails } from '@/app/grains/aliments/data/mockAliments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
      await prisma.unit_type.upsert({
        where: { id: 0 }, // fake where just to avoid dups if we could
        create: unit,
        update: {}
      }).catch(async () => {
        const existing = await prisma.unit_type.findFirst({ where: { name: unit.name } });
        if (!existing) await prisma.unit_type.create({ data: unit });
      });
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

    const units = await prisma.unit_type.findMany();
    const storages = await prisma.storage.findMany();

    const getUnitId = (name: string) => units.find(u => u.name.toLowerCase() === name.toLowerCase())?.id || units[0].id;
    const getStorageId = (name: string) => storages.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || storages[0].id;

    // 4. Insert Foods and FoodStorage
    for (const mockFood of mockAlimentsDetails) {
      const food = await prisma.food.create({
        data: {
          name: mockFood.fullName,
          common_name: mockFood.commonName,
          unit_type_id: getUnitId(mockFood.unit),
          is_active: true,
          price_per_ms: mockFood.pricePerMs || mockFood.pricePerTqs || 0,
          price_per_tqs: mockFood.pricePerTqs || 0,
          ms_percentage: mockFood.msPercentage || 100
        }
      });

      // Assign to storage
      await prisma.foodStorage.create({
        data: {
          food_id: food.id,
          storage_id: getStorageId(mockFood.storageLocation),
          current_stock: mockFood.currentStock
        }
      });
    }

    // 5. Insert dummy Suppliers, MasterContracts, SubContracts
    const supplier = await prisma.supplier.create({
      data: {
        name: "Synagri",
        phone_number: "450-123-4567",
        address: "123 Route Agricole",
        email: "contact@synagri.com",
        url: "synagri.com"
      }
    });

    const firstFood = await prisma.food.findFirst();
    if (firstFood) {
      const masterContract = await prisma.contract.create({
        data: {
          name: "Maïs Grain 2026",
          supplier_id: supplier.id,
          food_id: firstFood.id,
          total_kg: 120000,
          price_per_kg: 0.35,
          date_start: new Date('2026-01-01'),
          date_end: new Date('2026-12-31')
        }
      });

      // Create 3 sub-contracts
      const months = ["Janvier", "Février", "Mars"];
      for (const m of months) {
        await prisma.subContract.create({
          data: {
            contract_id: masterContract.id,
            name: `${m} 2026`,
            expected_kg: 40000,
            kg_left_to_deliver: 40000
          }
        });
      }
    }

    // 6. Insert default Groups
    const defaultGroups = [
      { name: "Ration groupe 1", real_animal_count: 48, animals_fed: 48, performance_index: 1 },
      { name: "Ration groupe 2", real_animal_count: 100, animals_fed: 99, performance_index: 1 },
      { name: "Ration groupe 3", real_animal_count: 77, animals_fed: 77, performance_index: 1 },
      { name: "Ration groupe 4", real_animal_count: 61, animals_fed: 61, performance_index: 1 },
      { name: "Ration Taures Gr 4", real_animal_count: 16, animals_fed: 16, performance_index: 1 },
      { name: "Ration Taures Gr 3", real_animal_count: 14, animals_fed: 14, performance_index: 1 },
      { name: "Ration Taures Gr 2", real_animal_count: 12, animals_fed: 12, performance_index: 1 },
      { name: "Ration Taures Gr 1", real_animal_count: 12, animals_fed: 12, performance_index: 1 },
      { name: "Ration Taries normales", real_animal_count: 33, animals_fed: 33, performance_index: 1 }
    ];

    for (const g of defaultGroups) {
      await prisma.group.create({ data: g });
    }

    return NextResponse.json({ message: "Database successfully seeded with new schema data!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "An error occurred during seeding." }, { status: 500 });
  }
}
