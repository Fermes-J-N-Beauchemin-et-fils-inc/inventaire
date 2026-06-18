import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { groups, groups_total } = body;

        if (!groups || typeof groups_total !== 'number') {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Check if there is already an active ration for today, if so, maybe we mark it as replaced or just let it be.
        // For simplicity, we just create a new one. The GET active will fetch the latest one.

        const newRation = await prisma.pushedRation.create({
            data: {
                groups_total,
                payload: groups,
                completed_keys: [],
            }
        });

        return NextResponse.json({ success: true, pushedRation: newRation });
    } catch (error) {
        console.error("Error pushing ration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
