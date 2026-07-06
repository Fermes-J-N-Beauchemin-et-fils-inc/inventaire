import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            select: {
                id: true,
                name: true,
                real_animal_count: true,
            }
        });

        // Add some grouping logic (Lactation, Relève, etc.) based on group names
        // Groups 1,2,3,4,5 are often Lactation, "Relève", "Taries", etc.
        let mappedGroups = groups.map(g => {
            let category = 'Autres';
            const name = g.name.toLowerCase();
            if (name.includes('groupe') || name.includes('lait')) category = 'En Lait';
            else if (name.includes('relève') || name.includes('releve') || name.includes('taure')) category = 'Relève';
            else if (name.includes('tarie')) category = 'Taries';
            else if (name.includes('boeuf') || name.includes('bœuf')) category = 'Bœuf';

            return {
                id: g.id,
                name: g.name,
                count: g.real_animal_count,
                category
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
            updates.map((update: any) => 
                prisma.group.update({
                    where: { id: parseInt(update.id) },
                    data: { real_animal_count: parseInt(update.count) }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating live cows:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
