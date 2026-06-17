import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/app/lib/db";
import RationClient from "./RationClient";

export const dynamic = 'force-dynamic';

export default async function RationPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    const isDistributor = (session?.user as any)?.role === "distributor";
    
    // Fetch all foods from the database to pass to RationClient
    const availableAliments = await prisma.food.findMany({
        select: {
            id: true,
            name: true,
            common_name: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    // Map the Prisma data to the format expected by RationClient
    const mappedAliments = availableAliments.map(a => ({
        id: a.id.toString(),
        name: a.common_name || a.name
    }));
    
    return <RationClient isDistributor={isDistributor} availableAliments={mappedAliments} />;
}
