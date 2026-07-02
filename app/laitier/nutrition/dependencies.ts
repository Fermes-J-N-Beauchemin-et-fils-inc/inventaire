'use server';

import { prisma } from '@/app/lib/db';
import { DependencyItem } from '../../grains/aliments/dependencies';

export async function checkGroupDependencies(groupId: number): Promise<DependencyItem[]> {
    const dependencies: DependencyItem[] = [];

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { mix_batch: true }
    });

    if (group?.mix_batch) {
        dependencies.push({
            type: 'mix_batch',
            name: `Assigné au mélange : ${group.mix_batch.name}`,
            url: '/laitier/groupements'
        });
    }

    return dependencies;
}
