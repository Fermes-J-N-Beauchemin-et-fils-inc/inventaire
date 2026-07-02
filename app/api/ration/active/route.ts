import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get today's beginning
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch the latest pushed ration for today
        const activeRation = await prisma.pushedRation.findFirst({
            where: {
                date: {
                    gte: today
                },
                status: 'EN_COURS'
            },
            orderBy: {
                date: 'desc'
            }
        });

        if (!activeRation) {
            return NextResponse.json({ activeRation: null });
        }

        return NextResponse.json({ activeRation });
    } catch (error) {
        console.error("Error fetching active ration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
