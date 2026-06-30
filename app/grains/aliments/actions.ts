'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAliment(formData: FormData) {
  const name = formData.get("name") as string;
  const unit_type_id = parseInt(formData.get("unit_type_id") as string, 10);
  const storage_id = parseInt(formData.get("storage_id") as string, 10);
  const price_per_ms = parseFloat(formData.get("price_per_ms") as string) || 0;
  const price_per_tqs = parseFloat(formData.get("price_per_tqs") as string) || 0;
  const ms_percentage = parseFloat(formData.get("ms_percentage") as string) || 0;
  const current_stock = parseFloat(formData.get("current_stock") as string) || 0;

  if (!name || isNaN(unit_type_id) || isNaN(storage_id)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.food.create({
    data: {
      name,
      unit_type_id,
      price_per_ms,
      price_per_tqs,
      ms_percentage,
      storages: {
        create: {
          storage_id: storage_id,
          current_stock
        }
      }
    },
  });

  revalidatePath('/aliments');
  redirect('/aliments');
}

export async function updateAliment(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const unit_type_id = parseInt(formData.get("unit_type_id") as string, 10);
  const storage_id = parseInt(formData.get("storage_id") as string, 10);
  const price_per_ms = parseFloat(formData.get("price_per_ms") as string) || 0;
  const price_per_tqs = parseFloat(formData.get("price_per_tqs") as string) || 0;
  const ms_percentage = parseFloat(formData.get("ms_percentage") as string) || 0;
  const current_stock = parseFloat(formData.get("current_stock") as string) || 0;

  if (!name || isNaN(unit_type_id) || isNaN(storage_id)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.food.update({
      where: { id },
      data: {
        name,
        unit_type_id,
        price_per_ms,
        price_per_tqs,
        ms_percentage,
      },
    });

    const existingStorage = await tx.foodStorage.findFirst({
      where: { food_id: id }
    });

    if (existingStorage) {
      if (existingStorage.storage_id !== storage_id || existingStorage.current_stock !== current_stock) {
        await tx.foodStorage.update({
          where: {
            food_id_storage_id: {
              food_id: id,
              storage_id: existingStorage.storage_id
            }
          },
          data: { storage_id, current_stock }
        });
      }
    } else {
      await tx.foodStorage.create({
        data: {
          food_id: id,
          storage_id,
          current_stock
        }
      });
    }
  });

  revalidatePath('/aliments');
  revalidatePath(`/aliments/${id}`);
  redirect(`/aliments/${id}`);
}

export async function toggleFoodStatus(foodId: number, isActive: boolean) {
  if (isNaN(foodId)) throw new Error("ID invalide.");
  
  await prisma.food.update({
    where: { id: foodId },
    data: { is_active: isActive }
  });

  revalidatePath('/aliments');
  revalidatePath(`/aliments/${foodId}`);
}

export async function deleteAliment(id: number) {
  try {
    // Delete associated records that don't have cascade delete (or where cascade might not be applied in DB)
    await prisma.$transaction([
      prisma.dailyServing.deleteMany({ where: { food_id: id } }),
      prisma.stockTransaction.deleteMany({ where: { food_id: id } }),
      prisma.delivery.deleteMany({ where: { food_id: id } }),
      prisma.sale.deleteMany({ where: { food_id: id } }),
      prisma.contract.deleteMany({ where: { food_id: id } }),
      prisma.saleContract.deleteMany({ where: { food_id: id } }),
      prisma.foodStorage.deleteMany({ where: { food_id: id } }),
      prisma.foodSnapshot.deleteMany({ where: { food_id: id } }),
      prisma.food.delete({ where: { id } })
    ]);
  } catch (error: any) {
    console.error("Error deleting aliment:", error);
    throw new Error("Impossible de supprimer l'aliment.");
  }
  
  revalidatePath('/aliments');
  redirect('/aliments');
}
