'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function receiveDelivery(formData: FormData) {
  const delivery_id = parseInt(formData.get("delivery_id") as string, 10);
  const quantity = parseFloat(formData.get("quantity") as string);

  if (isNaN(delivery_id) || isNaN(quantity)) {
    throw new Error("ID de livraison ou quantité invalide.");
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: delivery_id } });
  if (!delivery) throw new Error("Livraison introuvable.");

  await prisma.$transaction(async (tx) => {
    // 1. Update the delivery
    await tx.delivery.update({
      where: { id: delivery_id },
      data: {
        quantity_received: quantity,
        date_delivered: new Date(),
      }
    });

    // 2. Update the contract kg_left_to_deliver
    await tx.contract.update({
      where: { id: delivery.contract_id },
      data: {
        kg_left_to_deliver: {
          decrement: quantity
        }
      }
    });

    // 3. Update the food inventory. Assume quantity is in kg, and if unit_type is tm, we divide by 1000.
    const food = await tx.food.findUnique({
      where: { id: delivery.food_id },
      include: { unit_type: true }
    });

    if (food) {
      const isTm = food.unit_type.name.toLowerCase() === 'tm';
      const stockToAdd = isTm ? quantity / 1000 : quantity;

      await tx.food.update({
        where: { id: delivery.food_id },
        data: {
          current_stock: {
            increment: stockToAdd
          }
        }
      });

      // Log the transaction
      await tx.stockTransaction.create({
        data: {
          food_id: delivery.food_id,
          quantity: stockToAdd, // Addition
          transaction_type: "DELIVERY",
          recorded_at: new Date()
        }
      });
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
