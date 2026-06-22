'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function receiveComplexDelivery(formData: FormData) {
  const supplier_id = parseInt(formData.get("supplier_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const date_delivered = formData.get("date_delivered") as string;
  
  // sub_contracts is a JSON string of { sub_contract_id: number, quantity: number }[]
  const sub_contracts = JSON.parse(formData.get("sub_contracts") as string || "[]");
  // storages is a JSON string of { storage_id: number, quantity: number }[]
  const storages = JSON.parse(formData.get("storages") as string || "[]");

  if (isNaN(supplier_id) || isNaN(food_id) || isNaN(total_kg) || !date_delivered) {
    throw new Error("Champs obligatoires manquants.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create the delivery record
    const delivery = await tx.delivery.create({
      data: {
        supplier_id,
        food_id,
        quantity_received: total_kg,
        date_expected: new Date(date_delivered),
        date_delivered: new Date(date_delivered)
      }
    });

    // 2. Link and deduct from sub-contracts
    for (const sc of sub_contracts) {
      if (sc.quantity > 0) {
        await tx.deliverySubContract.create({
          data: {
            delivery_id: delivery.id,
            sub_contract_id: sc.sub_contract_id,
            quantity: sc.quantity
          }
        });

        await tx.subContract.update({
          where: { id: sc.sub_contract_id },
          data: { kg_left_to_deliver: { decrement: sc.quantity } }
        });
      }
    }

    // 3. Add to storages and create transactions
    const food = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
    if (!food) throw new Error("Aliment introuvable");
    const isTm = food.unit_type.name.toLowerCase() === 'tm';

    for (const st of storages) {
      if (st.quantity > 0) {
        const qtyToAdd = isTm ? st.quantity / 1000 : st.quantity;
        
        // Upsert FoodStorage
        await tx.foodStorage.upsert({
          where: { food_id_storage_id: { food_id: food_id, storage_id: st.storage_id } },
          update: { current_stock: { increment: qtyToAdd } },
          create: { food_id: food_id, storage_id: st.storage_id, current_stock: qtyToAdd }
        });

        await tx.stockTransaction.create({
          data: {
            food_id: food_id,
            storage_id: st.storage_id,
            quantity: qtyToAdd,
            transaction_type: "DELIVERY",
            recorded_at: new Date(date_delivered)
          }
        });
      }
    }
  });

  revalidatePath('/inventaire');
  revalidatePath('/fournisseurs');
}

export async function updateStorageCapacity(storageId: number, maxCapacityTm: number) {
  if (isNaN(storageId) || isNaN(maxCapacityTm) || maxCapacityTm < 0) {
    throw new Error("Valeurs invalides.");
  }

  await prisma.storage.update({
    where: { id: storageId },
    data: { max_capacity: maxCapacityTm }
  });

  revalidatePath('/inventaire');
}

export async function createStorage(formData: FormData) {
  const name = formData.get("name") as string;
  const max_capacity = parseFloat(formData.get("max_capacity") as string);

  if (!name || isNaN(max_capacity) || max_capacity < 0) {
    throw new Error("Nom ou capacité invalide.");
  }

  await prisma.storage.create({
    data: {
      name,
      max_capacity,
      is_active: true
    }
  });

  revalidatePath('/inventaire');
}

export async function toggleStorageStatus(storageId: number, isActive: boolean) {
  if (isNaN(storageId)) throw new Error("ID invalide.");
  
  await prisma.storage.update({
    where: { id: storageId },
    data: { is_active: isActive }
  });

  revalidatePath('/inventaire');
}
