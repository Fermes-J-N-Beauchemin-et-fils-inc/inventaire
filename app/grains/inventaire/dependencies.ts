'use server';

import { prisma } from '@/app/lib/db';
import { DependencyItem } from '../aliments/dependencies';

export async function checkStorageDependencies(storageId: number): Promise<DependencyItem[]> {
    const dependencies: DependencyItem[] = [];

    const storage = await prisma.storage.findUnique({
        where: { id: storageId },
        include: { food_storages: { include: { food: true } } }
    });

    if (storage?.food_storages && storage.food_storages.length > 0) {
        for (const fs of storage.food_storages) {
            if (fs.current_stock > 0 && fs.food) {
                dependencies.push({
                    type: 'storage',
                    name: `Contient actuellement : ${fs.food.name} (${fs.current_stock} kg)`,
                    url: `/grains/aliments/${fs.food.id}`
                });
            }
        }
    }

    return dependencies;
}
