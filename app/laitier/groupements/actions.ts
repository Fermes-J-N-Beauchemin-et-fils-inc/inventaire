'use server';

import { prisma } from '@/app/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMixBatches() {
  return await prisma.mixBatch.findMany({
    include: {
      groups: {
        orderBy: {
          mix_order: 'asc'
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });
}

export async function getUnassignedGroups() {
  return await prisma.group.findMany({
    where: {
      mix_batch_id: null
    },
    orderBy: {
      id: 'asc'
    }
  });
}

export async function createMixBatch(name: string) {
  try {
    const batch = await prisma.mixBatch.create({
      data: { name }
    });
    revalidatePath('/laitier/groupements');
    revalidatePath('/laitier/nutrition');
    return batch;
  } catch (error) {
    console.error("Erreur création mix batch:", error);
    throw error;
  }
}

export async function updateMixBatch(id: number, data: { name?: string, summer_two_meals?: boolean }) {
  try {
    const batch = await prisma.mixBatch.update({
      where: { id },
      data
    });
    revalidatePath('/laitier/groupements');
    revalidatePath('/laitier/nutrition');
    return batch;
  } catch (error) {
    console.error("Erreur update mix batch:", error);
    throw error;
  }
}

export async function deleteMixBatch(id: number) {
  try {
    // First, unassign all groups
    await prisma.group.updateMany({
      where: { mix_batch_id: id },
      data: { mix_batch_id: null, mix_order: null }
    });
    
    await prisma.mixBatch.delete({
      where: { id }
    });
    revalidatePath('/laitier/groupements');
    revalidatePath('/laitier/nutrition');
  } catch (error) {
    console.error("Erreur suppression mix batch:", error);
    throw error;
  }
}

export async function updateGroupBatchAssignment(groupId: number, mixBatchId: number | null, order: number | null) {
  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { 
        mix_batch_id: mixBatchId,
        mix_order: order
      }
    });
    revalidatePath('/laitier/groupements');
  } catch (error) {
    console.error("Erreur assignation groupe:", error);
    throw error;
  }
}

export async function updateBatchOrder(batchId: number, groupIds: number[]) {
  try {
    // Optimisation : Mettre à jour l'ordre de tous les groupes d'un batch
    const promises = groupIds.map((id, index) => 
      prisma.group.update({
        where: { id },
        data: { mix_order: index, mix_batch_id: batchId }
      })
    );
    await Promise.all(promises);
    revalidatePath('/laitier/groupements');
  } catch (error) {
    console.error("Erreur réordonnancement:", error);
    throw error;
  }
}
