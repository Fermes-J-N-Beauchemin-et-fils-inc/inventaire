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
    await prisma.$transaction(async (tx) => {
      // 1. Deliveries and SubContracts
      const deliveries = await tx.delivery.findMany({ where: { food_id: id }, select: { id: true } });
      if (deliveries.length > 0) {
        await tx.deliverySubContract.deleteMany({ where: { delivery_id: { in: deliveries.map(d => d.id) } } });
      }

      // 2. Sales and SubContract Allocations
      const sales = await tx.sale.findMany({ where: { food_id: id }, select: { id: true } });
      if (sales.length > 0) {
        await tx.saleSubContractAllocation.deleteMany({ where: { sale_id: { in: sales.map(s => s.id) } } });
      }

      // 3. Contracts
      const contracts = await tx.contract.findMany({ where: { food_id: id }, select: { id: true } });
      if (contracts.length > 0) {
        const subContracts = await tx.subContract.findMany({ where: { contract_id: { in: contracts.map(c => c.id) } }, select: { id: true } });
        if (subContracts.length > 0) {
          await tx.deliverySubContract.deleteMany({ where: { sub_contract_id: { in: subContracts.map(sc => sc.id) } } });
        }
        await tx.subContract.deleteMany({ where: { contract_id: { in: contracts.map(c => c.id) } } });
      }

      // 4. SaleContracts
      const saleContracts = await tx.saleContract.findMany({ where: { food_id: id }, select: { id: true } });
      if (saleContracts.length > 0) {
        const saleSubContracts = await tx.saleSubContract.findMany({ where: { sale_contract_id: { in: saleContracts.map(c => c.id) } }, select: { id: true } });
        if (saleSubContracts.length > 0) {
          await tx.saleSubContractAllocation.deleteMany({ where: { sale_sub_contract_id: { in: saleSubContracts.map(sc => sc.id) } } });
        }
        await tx.saleSubContract.deleteMany({ where: { sale_contract_id: { in: saleContracts.map(c => c.id) } } });
      }

      // 5. Normal deletions
      await tx.dailyServing.deleteMany({ where: { food_id: id } });
      await tx.stockTransaction.deleteMany({ where: { food_id: id } });
      await tx.delivery.deleteMany({ where: { food_id: id } });
      await tx.sale.deleteMany({ where: { food_id: id } });
      await tx.contract.deleteMany({ where: { food_id: id } });
      await tx.saleContract.deleteMany({ where: { food_id: id } });
      await tx.foodStorage.deleteMany({ where: { food_id: id } });
      await tx.foodSnapshot.deleteMany({ where: { food_id: id } });
      
      // Finally, delete food
      await tx.food.delete({ where: { id } });
    });
  } catch (error: any) {
    console.error("Error deleting aliment:", error);
    throw new Error("Impossible de supprimer l'aliment.");
  }
  
  revalidatePath('/aliments');
  redirect('/aliments');
}
