'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAliment(formData: FormData) {
  const name = formData.get("name") as string;
  const unit_type_id = parseInt(formData.get("unit_type_id") as string, 10);
  const storage_id = parseInt(formData.get("storage_id") as string, 10);
  const current_stock = parseFloat(formData.get("current_stock") as string);
  const price_per_ms = parseFloat(formData.get("price_per_ms") as string) || 0;
  const price_per_tqs = parseFloat(formData.get("price_per_tqs") as string) || 0;
  const ms_percentage = parseFloat(formData.get("ms_percentage") as string) || 0;

  if (!name || isNaN(unit_type_id) || isNaN(storage_id) || isNaN(current_stock)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.food.create({
    data: {
      name,
      unit_type_id,
      storage_id,
      current_stock,
      price_per_ms,
      price_per_tqs,
      ms_percentage,
    },
  });

  revalidatePath('/aliments');
  redirect('/aliments');
}

export async function updateAliment(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const unit_type_id = parseInt(formData.get("unit_type_id") as string, 10);
  const storage_id = parseInt(formData.get("storage_id") as string, 10);
  const current_stock = parseFloat(formData.get("current_stock") as string);
  const price_per_ms = parseFloat(formData.get("price_per_ms") as string) || 0;
  const price_per_tqs = parseFloat(formData.get("price_per_tqs") as string) || 0;
  const ms_percentage = parseFloat(formData.get("ms_percentage") as string) || 0;

  if (!name || isNaN(unit_type_id) || isNaN(storage_id) || isNaN(current_stock)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.food.update({
    where: { id },
    data: {
      name,
      unit_type_id,
      storage_id,
      current_stock,
      price_per_ms,
      price_per_tqs,
      ms_percentage,
    },
  });

  revalidatePath('/aliments');
  revalidatePath(`/aliments/${id}`);
  redirect(`/aliments/${id}`);
}
