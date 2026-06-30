'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteAliment(id: number) {
  try {
    // Delete associated records that don't have cascade delete
    await prisma.$transaction([
      prisma.dailyServing.deleteMany({ where: { food_id: id } }),
      prisma.stockTransaction.deleteMany({ where: { food_id: id } }),
      prisma.delivery.deleteMany({ where: { food_id: id } }),
      prisma.sale.deleteMany({ where: { food_id: id } }),
      prisma.contract.deleteMany({ where: { food_id: id } }),
      prisma.saleContract.deleteMany({ where: { food_id: id } }),
      prisma.food.delete({ where: { id } })
    ]);
  } catch (error: any) {
    console.error("Error deleting aliment:", error);
    return { error: "Impossible de supprimer l'aliment (peut-être lié à d'autres enregistrements protégés)." };
  }
  
  revalidatePath('/grains/aliments');
  redirect('/grains/aliments');
}
