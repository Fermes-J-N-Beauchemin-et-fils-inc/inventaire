import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            select: {
                id: true,
                name: true,
                real_animal_count: true,
                category: true,
            }
        });

        let mappedGroups = groups.map(g => {
            return {
                id: g.id,
                name: g.name,
                count: g.real_animal_count,
                category: g.category || 'Autres'
            };
        });

        // Removed mock data fallback so user can see their actual groups even if counts are 0

        return NextResponse.json({ 
            success: true, 
            groups: mappedGroups,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error fetching live cows:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { updates } = data; // Array of { id, count }

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Use a transaction to perform all updates safely
        await prisma.$transaction(
            updates.map((update: any) => {
                const dataToUpdate: any = {};
                if (update.count !== undefined) dataToUpdate.real_animal_count = parseInt(update.count);
                if (update.category !== undefined) dataToUpdate.category = update.category;
                
                return prisma.group.update({
                    where: { id: parseInt(update.id) },
                    data: dataToUpdate
                });
            })
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating live cows:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
