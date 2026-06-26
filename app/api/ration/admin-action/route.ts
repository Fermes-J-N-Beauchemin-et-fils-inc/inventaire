import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const ration = await prisma.pushedRation.findUnique({ where: { id } });
        if (!ration) {
            return NextResponse.json({ error: "Ration not found" }, { status: 404 });
        }

        if (action === 'cancel') {
            await prisma.pushedRation.update({
                where: { id },
                data: { status: 'ANNULEE' }
            });
            return NextResponse.json({ success: true, message: "Ration annulée." });
        }

        if (action === 'finish') {
            await prisma.pushedRation.update({
                where: { id },
                data: { status: 'TERMINEE' }
            });
            return NextResponse.json({ success: true, message: "Ration terminée de force." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in admin-action:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
