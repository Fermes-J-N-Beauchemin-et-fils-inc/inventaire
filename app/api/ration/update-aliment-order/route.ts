import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { rationId, groupKey, aliments } = body;

        if (!rationId || !groupKey || !aliments) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const pushedRation = await prisma.pushedRation.findUnique({
            where: { id: parseInt(rationId) }
        });

        if (!pushedRation) {
            return NextResponse.json({ error: "Ration not found" }, { status: 404 });
        }

        const payload = pushedRation.payload as any;
        
        let groups = payload.groups || payload;
        
        if (groups && groups[groupKey]) {
            groups[groupKey].aliments = aliments;
        }

        await prisma.pushedRation.update({
            where: { id: parseInt(rationId) },
            data: { payload }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating aliment order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
