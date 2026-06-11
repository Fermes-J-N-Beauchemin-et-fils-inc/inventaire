import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import RationClient from "./RationClient";

export default async function RationPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    const isDistributor = (session?.user as any)?.role === "distributor";
    
    return <RationClient isDistributor={isDistributor} />;
}
