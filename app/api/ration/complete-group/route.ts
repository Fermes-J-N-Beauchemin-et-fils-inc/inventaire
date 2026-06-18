import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, group_key } = body;

        if (!id || !group_key) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const pushedRation = await prisma.pushedRation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pushedRation) {
            return NextResponse.json({ error: "Ration not found" }, { status: 404 });
        }

        let completedKeys = Array.isArray(pushedRation.completed_keys) 
            ? [...pushedRation.completed_keys] 
            : [];

        if (completedKeys.includes(group_key)) {
            return NextResponse.json({ success: true, message: "Already completed" });
        }

        completedKeys.push(group_key);
        const newGroupsDone = completedKeys.length;
        const newStatus = newGroupsDone >= pushedRation.groups_total ? "TERMINEE" : "EN_COURS";

        const updated = await prisma.pushedRation.update({
            where: { id: parseInt(id) },
            data: {
                completed_keys: completedKeys,
                groups_done: newGroupsDone,
                status: newStatus
            }
        });

        return NextResponse.json({ success: true, pushedRation: updated });
    } catch (error) {
        console.error("Error completing group:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
