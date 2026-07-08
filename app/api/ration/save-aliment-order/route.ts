import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { groupKey, orderedIds } = body;

        if (!groupKey || !orderedIds || !Array.isArray(orderedIds)) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        if (groupKey.startsWith('batch_')) {
            const batchId = parseInt(groupKey.replace('batch_', ''));
            await prisma.mixBatch.update({
                where: { id: batchId },
                data: { aliments_order: orderedIds }
            });
        } else {
            const groupId = parseInt(groupKey);
            await prisma.group.update({
                where: { id: groupId },
                data: { aliments_order: orderedIds }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error saving aliment order to base DB:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
