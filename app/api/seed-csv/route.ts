import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('secret') !== 'seed123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Paths to CSVs
    const alimentCsvPath = path.join(process.cwd(), 'public', 'seed', 'Alimentation 260618-normal(Aliment).csv');
    const invCsvPath = path.join(process.cwd(), 'public', 'seed', 'Alimentation 260618-normal(Inv.csv');
    // For now we will focus on these two main files for Foods, Storages, and Inventory

    if (!fs.existsSync(alimentCsvPath) || !fs.existsSync(invCsvPath)) {
      return NextResponse.json({ error: 'CSV files not found in public/seed' }, { status: 404 });
    }

    // --- WIPE DATABASE ---
    await prisma.stockTransaction.deleteMany({});
    await prisma.foodStorage.deleteMany({});
    await prisma.saleSubContractAllocation.deleteMany({});
    await prisma.saleSubContract.deleteMany({});
    await prisma.saleContract.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.deliverySubContract.deleteMany({});
    await prisma.subContract.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.delivery.deleteMany({});
    await prisma.storage.deleteMany({});
    await prisma.food.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.unit_type.deleteMany({});

    // Create Base Units
    const unitTm = await prisma.unit_type.create({ data: { name: 'tm', ration_to_kg: 1000 } });
    const unitKg = await prisma.unit_type.create({ data: { name: 'kg', ration_to_kg: 1 } });

    // --- PARSE ALIMENTS ---
    const alimentContent = fs.readFileSync(alimentCsvPath, 'utf-8');
    const alimentLines = alimentContent.split('\n');
    
    // Line 7+ has the foods
    const createdFoods: any[] = [];
    for (let i = 6; i < alimentLines.length; i++) {
      const cols = alimentLines[i].split(',').map(c => c.trim());
      if (cols.length < 5) continue;
      
      const storageType = cols[1]; // Bunker, Poches, Shed, etc.
      const name = cols[2];
      
      if (!name) continue;

      let msStr = cols[5]?.replace('%', '');
      let msVal = parseFloat(msStr);
      if (isNaN(msVal)) msVal = 0;

      const food = await prisma.food.create({
        data: {
          name: name,
          unit_type_id: unitTm.id, // Assuming tm by default for these
          ms_percentage: msVal
        }
      });
      createdFoods.push({ id: food.id, name: food.name, rawName: name, storageType: storageType });
    }

    // --- PARSE INVENTORIES (Silos/Bunkers) ---
    // --- PARSE INVENTORIES (Silos/Bunkers) ---
    // invCsvPath is already defined above
    const invContent = fs.readFileSync(invCsvPath, 'utf-8');
    const invLines = invContent.split('\n');

    const createdStorages: any[] = [];
    const createdFoodStorages: any[] = [];

    // Simple heuristic parser for the weird Excel CSV
    for (let i = 0; i < invLines.length; i++) {
      const line = invLines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
      
      // Look for lines that look like: "180,Cellule 1 [Ens. Foin 1e 2026],5.5,36%,356,990..."
      // Or "30,Foin sec Coulombe haché,329,86%,8.5,9.9..."
      // Or "19,Silo bleu (25x80),5.5,85%,89,105.0..."
      // Or "130,Balles carrées sec [3x3x7],270,86%,30,35.1..."

      // Check if col[0] is a number (qty or feet or doors) and col[1] is a description
      const qtyOrFeet = parseFloat(cols[0]);
      const desc = cols[1];
      
      if (!isNaN(qtyOrFeet) && qtyOrFeet > 0 && desc && desc.length > 2) {
        // Find MS percentage, typically col 3
        const ms = cols[3]?.includes('%') ? parseFloat(cols[3].replace('%', '')) : 0;
        
        // Find TQS (Total quantity), typically col 5
        let tqs = parseFloat(cols[5]);
        if (isNaN(tqs)) tqs = 0;
        
        // If TQS is 0 but we have a description, maybe we can use it as a storage anyway
        
        // 1. Create or Find Storage (We'll use the description as storage name for bunkers/silos)
        let storageName = "Zone: " + desc;
        if (desc.includes('Cellule') || desc.includes('Silo') || desc.includes('Meule')) {
           storageName = desc.split('[')[0].trim(); // Extract 'Cellule 1'
        }

        let st = await prisma.storage.findFirst({ where: { name: storageName } });
        if (!st) {
          st = await prisma.storage.create({
            data: {
              name: storageName,
              max_capacity: 5000,
              is_active: true
            }
          });
        }

        // 2. Create or Find Food based on description
        let foodName = desc;
        if (desc.includes('[')) {
          foodName = desc.substring(desc.indexOf('[') + 1, desc.indexOf(']'));
        }

        let food = await prisma.food.findFirst({ where: { name: foodName } });
        if (!food) {
          food = await prisma.food.create({
            data: {
              name: foodName,
              unit_type_id: unitTm.id,
              ms_percentage: ms || 0
            }
          });
        }

        // 3. Link Food to Storage with current_stock (handling duplicates)
        const existingFs = await prisma.foodStorage.findUnique({
          where: {
            food_id_storage_id: {
              food_id: food.id,
              storage_id: st.id
            }
          }
        });

        if (existingFs) {
          await prisma.foodStorage.update({
            where: { 
              food_id_storage_id: {
                food_id: food.id,
                storage_id: st.id
              }
            },
            data: { current_stock: existingFs.current_stock + tqs }
          });
        } else {
          await prisma.foodStorage.create({
            data: {
              food_id: food.id,
              storage_id: st.id,
              current_stock: tqs // TQS is already in tm usually in this file
            }
          });
        }
        
        createdFoodStorages.push({ food: foodName, storage: storageName, qty: tqs });
      }
    }

    // Add generic storages from Aliment type just in case
    const storageTypes = Array.from(new Set(createdFoods.map(f => f.storageType).filter(Boolean)));
    for (const type of storageTypes) {
      const existing = await prisma.storage.findFirst({ where: { name: type } });
      if (!existing && type.length > 1) {
         await prisma.storage.create({
            data: { name: type, max_capacity: 1000, is_active: true }
         });
      }
    }

    // Create a default supplier and client just so the app works
    await prisma.supplier.create({ data: { name: "Fournisseur par défaut", is_active: true, phone_number: "", address: "", email: "" } });
    await prisma.client.create({ data: { name: "Client par défaut", is_active: true, phone_number: "", address: "", email: "" } });

    return NextResponse.json({ 
      success: true, 
      message: 'Base database seeded from CSV context.',
      foodsCreated: createdFoods.length,
      inventoriesCreated: createdFoodStorages.length,
      details: createdFoodStorages
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
