'use server';

import { prisma } from '@/app/lib/db';

export type DependencyItem = {
    type: 'storage' | 'group' | 'mix_batch' | 'ration';
    name: string;
    url: string;
};

export async function checkFoodDependencies(foodId: number): Promise<DependencyItem[]> {
    const dependencies: DependencyItem[] = [];

    // Check Storage
    const storages = await prisma.foodStorage.findMany({
        where: { food_id: foodId, current_stock: { gt: 0 } },
        include: { storage: true }
    });

    for (const foodStorage of storages) {
        if (foodStorage.storage) {
            dependencies.push({
                type: 'storage',
                name: `Silo/Bac : ${foodStorage.storage.name}`,
                url: '/grains/inventaire'
            });
        }
    }

    // Check Groups (Daily Servings)
    const servings = await prisma.dailyServing.findMany({
        where: { food_id: foodId },
        include: { group: true }
    });

    for (const serving of servings) {
        if (serving.group) {
            dependencies.push({
                type: 'group',
                name: `Groupe : ${serving.group.name}`,
                url: '/laitier/nutrition'
            });
        }
    }

    return dependencies;
}
