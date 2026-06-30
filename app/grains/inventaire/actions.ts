'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function receiveComplexDelivery(formData: FormData) {
  const supplier_id = parseInt(formData.get("supplier_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const date_delivered = formData.get("date_delivered") as string;
  const existing_delivery_id = formData.get("existing_delivery_id") ? parseInt(formData.get("existing_delivery_id") as string, 10) : null;
  
  // sub_contracts is a JSON string of { sub_contract_id: number, quantity: number }[]
  const sub_contracts = JSON.parse(formData.get("sub_contracts") as string || "[]");
  // storages is a JSON string of { storage_id: number, quantity: number }[]
  const storages = JSON.parse(formData.get("storages") as string || "[]");

  if (isNaN(supplier_id) || isNaN(food_id) || isNaN(total_kg) || !date_delivered) {
    throw new Error("Champs obligatoires manquants.");
  }

  await prisma.$transaction(async (tx) => {
    let delivery;
    if (existing_delivery_id && !isNaN(existing_delivery_id)) {
      // It's a planned delivery, we update it
      delivery = await tx.delivery.update({
        where: { id: existing_delivery_id },
        data: {
          supplier_id,
          food_id,
          quantity_received: total_kg,
          date_delivered: new Date(date_delivered)
        }
      });
      // Delete existing sub-contract links since we recreate them below based on the new allocation
      await tx.deliverySubContract.deleteMany({
        where: { delivery_id: existing_delivery_id }
      });
    } else {
      // 1. Create a new delivery record
      delivery = await tx.delivery.create({
        data: {
          supplier_id,
          food_id,
          quantity_received: total_kg,
          date_expected: new Date(date_delivered),
          date_delivered: new Date(date_delivered)
        }
      });
    }

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

    const food = await tx.food.findUnique({
      where: { id: food_id },
      include: { unit_type: true }
    });
    if (!food) throw new Error("Aliment introuvable.");
    const isTm = food.unit_type?.name.toLowerCase() === 'tm';
    const ration_to_kg = isTm ? 1000 : (food.unit_type?.ration_to_kg || 1);

    // 3. Add to storages and create transactions
    for (const st of storages) {
      if (st.quantity > 0) {
        const qtyInUnit = st.quantity / ration_to_kg;
        // Upsert FoodStorage
        await tx.foodStorage.upsert({
          where: { food_id_storage_id: { food_id: food_id, storage_id: st.storage_id } },
          update: { current_stock: { increment: qtyInUnit } },
          create: { food_id: food_id, storage_id: st.storage_id, current_stock: qtyInUnit }
        });

        await tx.stockTransaction.create({
          data: {
            food_id: food_id,
            storage_id: st.storage_id,
            quantity: qtyInUnit,
            transaction_type: "DELIVERY",
            recorded_at: new Date(date_delivered)
          }
        });
      }
    }
  });

  revalidatePath('/inventaire');
  revalidatePath('/transactions');
}
export async function createComplexSale(formData: FormData) {
  const client_id = parseInt(formData.get("client_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const date_sold = formData.get("date_sold") as string;
  const existing_sale_id = formData.get("existing_sale_id") ? parseInt(formData.get("existing_sale_id") as string, 10) : null;
  
  // sub_contracts is a JSON string of { sub_contract_id: number, quantity: number }[]
  const sub_contracts = JSON.parse(formData.get("sub_contracts") as string || "[]");
  // storages is a JSON string of { storage_id: number, quantity: number }[]
  const storages = JSON.parse(formData.get("storages") as string || "[]");

  if (isNaN(client_id) || isNaN(food_id) || isNaN(total_kg) || !date_sold) {
    throw new Error("Champs obligatoires manquants.");
  }

  await prisma.$transaction(async (tx) => {
    let sale;
    if (existing_sale_id && !isNaN(existing_sale_id)) {
      sale = await tx.sale.update({
        where: { id: existing_sale_id },
        data: {
          client_id,
          food_id,
          quantity_sold: total_kg,
          date_sold: new Date(date_sold)
        }
      });
      await tx.saleSubContractAllocation.deleteMany({
        where: { sale_id: existing_sale_id }
      });
    } else {
      // 1. Create the sale record
      sale = await tx.sale.create({
        data: {
          client_id,
          food_id,
          quantity_sold: total_kg,
          date_expected: new Date(date_sold),
          date_sold: new Date(date_sold)
        }
      });
    }

    // 2. Link and deduct from sub-contracts
    for (const sc of sub_contracts) {
      if (sc.quantity > 0) {
        await tx.saleSubContractAllocation.create({
          data: {
            sale_id: sale.id,
            sale_sub_contract_id: sc.sub_contract_id,
            quantity: sc.quantity
          }
        });

        await tx.saleSubContract.update({
          where: { id: sc.sub_contract_id },
          data: { kg_left_to_deliver: { decrement: sc.quantity } }
        });
      }
    }

    const food = await tx.food.findUnique({
      where: { id: food_id },
      include: { unit_type: true }
    });
    if (!food) throw new Error("Aliment introuvable.");
    const isTm = food.unit_type?.name.toLowerCase() === 'tm';
    const ration_to_kg = isTm ? 1000 : (food.unit_type?.ration_to_kg || 1);

    // 3. Deduct from storages and create transactions
    for (const st of storages) {
      if (st.quantity > 0) {
        const qtyInUnit = st.quantity / ration_to_kg;
        // Update FoodStorage (we decrement)
        // We ensure there's enough stock, otherwise Prisma might throw if we have unsigned, but we just decrement here.
        await tx.foodStorage.update({
          where: { food_id_storage_id: { food_id: food_id, storage_id: st.storage_id } },
          data: { current_stock: { decrement: qtyInUnit } }
        });

        await tx.stockTransaction.create({
          data: {
            food_id: food_id,
            storage_id: st.storage_id,
            quantity: -qtyInUnit, // negative for sale
            transaction_type: "SALE",
            recorded_at: new Date(date_sold)
          }
        });
      }
    }
  });

  revalidatePath('/inventaire');
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/comptabilite');
}

export async function updateStorage(storageId: number, name: string, maxCapacityTm: number) {
  if (isNaN(storageId) || !name || isNaN(maxCapacityTm) || maxCapacityTm < 0) {
    throw new Error("Valeurs invalides.");
  }

  await prisma.storage.update({
    where: { id: storageId },
    data: { 
      name: name,
      max_capacity: maxCapacityTm 
    }
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

export async function deleteStorage(storageId: number) {
  try {
    await prisma.$transaction([
      prisma.foodStorage.deleteMany({ where: { storage_id: storageId } }),
      prisma.stockTransaction.deleteMany({ where: { storage_id: storageId } }),
      prisma.storage.delete({ where: { id: storageId } })
    ]);
  } catch (error) {
    console.error("Failed to delete storage", error);
    throw new Error("Impossible de supprimer le stockage");
  }
  revalidatePath('/grains/inventaire');
  revalidatePath('/aliments');
}
