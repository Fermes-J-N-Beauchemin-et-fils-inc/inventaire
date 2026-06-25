import { prisma } from "@/app/lib/db";
import { AlimentDetail, generateHistory, generatePriceHistory } from "./mockAliments";

// We keep the mock generators for history and nutritional values 
// since they don't seem to exist fully in the current DB schema yet.

export async function fetchAliments(): Promise<AlimentDetail[]> {
  try {
    const foods = await prisma.food.findMany({
      include: {
        unit_type: true,
        storages: { include: { storage: true } },
        contracts: { include: { sub_contracts: true } }, // Used to determine if there's an active order
      },
      orderBy: {
        id: 'asc'
      }
    });

    const mappedAliments: AlimentDetail[] = foods.map((food: any) => {
      // Calculate if there's an active order based on contracts
      const now = new Date();
      const hasActiveOrder = food.contracts.some(
        (contract: any) => contract.date_start <= now && contract.date_end >= now && 
          contract.sub_contracts.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) > 0
      );

      const currentStock = food.storages.reduce((sum: number, s: any) => sum + s.current_stock, 0);
      const maxStock = food.storages.reduce((sum: number, s: any) => sum + s.storage.max_capacity, 0);
      const storageLocation = food.storages.map((s: any) => s.storage.name).join(', ') || 'Aucun silo';

      return {
        id: food.id.toString(),
        fullName: food.name,
        commonName: food.name, // Using name for both as schema only has one name field
        msPercentage: food.ms_percentage,
        humidityPercentage: 100 - food.ms_percentage,
        maxStock: maxStock,
        currentStock: currentStock,
        unit: food.unit_type.name as any, // Cast to any or the specific union type
        consumptionRate: 0, // Fallback, would need daily_servings aggregation
        hasActiveOrder,
        storageLocation: storageLocation,
        notes: "", // Not present in schema for Food
        pricePerMs: food.price_per_ms,
        pricePerTqs: food.price_per_tqs,
        // Mocking nutritional values and history as they aren't in schema
        nutritionalValues: { NDF: 0, ADF: 0, PDI: 0, PDR: 0, MAT: 0, ENC: 0, ENL: 0 },
        consumptionHistory: generateHistory(1, 0.2, 0),
        priceHistory: generatePriceHistory(food.price_per_ms, food.price_per_tqs),
        msHistory: generateHistory(food.ms_percentage, 1.5, 0),
        isActive: food.is_active,
      };
    });

    return mappedAliments;
  } catch (error) {
    console.error("Error fetching aliments:", error);
    return [];
  }
}
