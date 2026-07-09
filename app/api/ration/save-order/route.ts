import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tour1Keys, tour2Keys } = body;

        if (!Array.isArray(tour1Keys)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Update Tour 1 orders
            for (let i = 0; i < tour1Keys.length; i++) {
                const key = tour1Keys[i];
                if (key.startsWith('batch_')) {
                    const batchId = parseInt(key.replace('batch_', ''));
                    if (!isNaN(batchId)) {
                        await tx.mixBatch.update({ where: { id: batchId }, data: { tour1_order: i } });
                    }
                } else {
                    const groupId = parseInt(key);
                    if (!isNaN(groupId)) {
                        await tx.group.update({ where: { id: groupId }, data: { tour1_order: i } });
                    }
                }
            }

            // Update Tour 2 orders
            if (Array.isArray(tour2Keys)) {
                for (let i = 0; i < tour2Keys.length; i++) {
                    const key = tour2Keys[i];
                    if (key.startsWith('batch_')) {
                        const batchId = parseInt(key.replace('batch_', ''));
                        if (!isNaN(batchId)) {
                            await tx.mixBatch.update({ where: { id: batchId }, data: { tour2_order: i } });
                        }
                    } else {
                        const groupId = parseInt(key);
                        if (!isNaN(groupId)) {
                            await tx.group.update({ where: { id: groupId }, data: { tour2_order: i } });
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving group order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
