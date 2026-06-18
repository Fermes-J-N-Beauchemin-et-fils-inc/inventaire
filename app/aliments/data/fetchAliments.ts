import { prisma } from "@/app/lib/db";
import { AlimentDetail, generateHistory, generatePriceHistory } from "./mockAliments";

// We keep the mock generators for history and nutritional values 
// since they don't seem to exist fully in the current DB schema yet.

export async function fetchAliments(): Promise<AlimentDetail[]> {
  try {
    const foods = await prisma.food.findMany({
      include: {
        unit_type: true,
        storage: true,
        contracts: true, // Used to determine if there's an active order
      },
      orderBy: {
        id: 'asc'
      }
    });

    const mappedAliments: AlimentDetail[] = foods.map((food) => {
      // Calculate if there's an active order based on contracts
      const now = new Date();
      const hasActiveOrder = food.contracts.some(
        (contract) => contract.date_start <= now && contract.date_end >= now && contract.kg_left_to_deliver > 0
      );

      return {
        id: food.id.toString(),
        fullName: food.name,
        commonName: food.name, // Using name for both as schema only has one name field
        msPercentage: food.ms_percentage,
        humidityPercentage: 100 - food.ms_percentage,
        maxStock: food.storage.max_capacity,
        currentStock: food.current_stock,
        unit: food.unit_type.name as any, // Cast to any or the specific union type
        consumptionRate: 0, // Fallback, would need daily_servings aggregation
        hasActiveOrder,
        storageLocation: food.storage.name,
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
