'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function updateDailyServing(groupId: number, foodId: number, dailyKgServingMs: number, isTopDress: boolean = false) {
  if (dailyKgServingMs <= 0) {
    // If set to 0, delete it if it exists
    await prisma.dailyServing.deleteMany({
      where: {
        group_id: groupId,
        food_id: foodId
      }
    });
  } else {
    // Upsert the value
    const existing = await prisma.dailyServing.findFirst({
      where: {
        group_id: groupId,
        food_id: foodId
      }
    });

    if (existing) {
      await prisma.dailyServing.update({
        where: { id: existing.id },
        data: { daily_kg_serving_ms: dailyKgServingMs, is_top_dress: isTopDress }
      });
    } else {
      await prisma.dailyServing.create({
        data: {
          group_id: groupId,
          food_id: foodId,
          daily_kg_serving_ms: dailyKgServingMs,
          is_top_dress: isTopDress
        }
      });
    }
  }

  // Force refresh the page cache so the changes show up
  revalidatePath('/nutrition');
  revalidatePath('/ration'); // Since it affects the main ration too
}

export async function createGroup(name: string, real_animal_count: number) {
  await prisma.group.create({
    data: {
      name,
      real_animal_count,
      animals_fed: real_animal_count, // default to real_count
      performance_index: 1.0,
    }
  });
  revalidatePath('/laitier/nutrition');
  revalidatePath('/laitier/sommaire');
}

export async function updateGroup(id: number, name: string, real_animal_count: number) {
  await prisma.group.update({
    where: { id },
    data: { name, real_animal_count }
  });
  revalidatePath('/laitier/nutrition');
  revalidatePath('/laitier/sommaire');
}

export async function deleteGroup(id: number) {
  try {
    await prisma.$transaction([
      prisma.dailyServing.deleteMany({ where: { group_id: id } }),
      prisma.groupSnapshot.deleteMany({ where: { group_id: id } }),
      prisma.group.delete({ where: { id } })
    ]);
  } catch (error) {
    console.error("Failed to delete group", error);
    throw new Error("Impossible de supprimer le groupe");
  }
  revalidatePath('/laitier/nutrition');
  revalidatePath('/laitier/sommaire');
}

export async function updateGroupTargetMs(groupId: number, targetMs: number | null) {
  await prisma.group.update({
    where: { id: groupId },
    data: { target_ms_per_cow: targetMs }
  });
  revalidatePath('/laitier/nutrition');
  revalidatePath('/grains/rations');
}

export async function upsertManualServing(
  groupId: number,
  servingId: number | null,
  name: string,
  msPercentage: number,
  qtyTqs: number,
  isTopDress: boolean = false
) {
  const dailyKgServingMs = qtyTqs * (msPercentage / 100);

  if (servingId) {
    await prisma.dailyServing.update({
      where: { id: servingId },
      data: {
        manual_name: name,
        manual_ms_percentage: msPercentage,
        manual_qty_tqs: qtyTqs,
        daily_kg_serving_ms: dailyKgServingMs,
        is_top_dress: isTopDress
      }
    });
  } else {
    await prisma.dailyServing.create({
      data: {
        group_id: groupId,
        is_manual: true,
        manual_name: name,
        manual_ms_percentage: msPercentage,
        manual_qty_tqs: qtyTqs,
        daily_kg_serving_ms: dailyKgServingMs,
        is_top_dress: isTopDress
      }
    });
  }
  revalidatePath('/laitier/nutrition');
  revalidatePath('/grains/rations');
}

export async function deleteManualServing(servingId: number) {
  await prisma.dailyServing.delete({
    where: { id: servingId }
  });
  revalidatePath('/laitier/nutrition');
  revalidatePath('/grains/rations');
}

export async function updateFoodMs(foodId: number, msPercentage: number) {
  await prisma.food.update({
    where: { id: foodId },
    data: { ms_percentage: msPercentage }
  });
  revalidatePath('/laitier/nutrition');
  revalidatePath('/grains/rations');
}

export async function upsertReferenceServing(
  groupId: number,
  servingId: number | null,
  referenceGroupId: number,
  qtyTqs: number,
  msPercentage: number
) {
  const dailyKgServingMs = qtyTqs * (msPercentage / 100);

  if (servingId) {
    await prisma.dailyServing.update({
      where: { id: servingId },
      data: {
        reference_group_id: referenceGroupId,
        manual_ms_percentage: msPercentage,
        manual_qty_tqs: qtyTqs,
        daily_kg_serving_ms: dailyKgServingMs
      }
    });
  } else {
    await prisma.dailyServing.create({
      data: {
        group_id: groupId,
        is_manual: true,
        reference_group_id: referenceGroupId,
        manual_ms_percentage: msPercentage,
        manual_qty_tqs: qtyTqs,
        daily_kg_serving_ms: dailyKgServingMs
      }
    });
  }
  revalidatePath('/laitier/nutrition');
  revalidatePath('/grains/rations');
}
