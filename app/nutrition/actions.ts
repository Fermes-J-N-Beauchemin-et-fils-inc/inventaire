'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function updateDailyServing(groupId: number, foodId: number, dailyKgServingMs: number) {
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
        data: { daily_kg_serving_ms: dailyKgServingMs }
      });
    } else {
      await prisma.dailyServing.create({
        data: {
          group_id: groupId,
          food_id: foodId,
          daily_kg_serving_ms: dailyKgServingMs
        }
      });
    }
  }

  // Force refresh the page cache so the changes show up
  revalidatePath('/nutrition');
  revalidatePath('/ration'); // Since it affects the main ration too
}
