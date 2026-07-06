import Sidenav from "@/app/components/ui/sidenav";
import SommaireClient from "./SommaireClient";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export default async function SommaireTroupeauPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        <SommaireClient isAdmin={isAdmin} />
      </div>
    </Sidenav>
  );
}
