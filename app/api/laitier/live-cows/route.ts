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
        const mappedGroups = groups.map(g => {
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
