import Sidenav from "@/app/components/ui/sidenav";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AccountSettings from "./components/AccountSettings";

export default async function ComptePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    const user = session?.user;
    if (!user) {
        redirect("/api/auth/clear-local");
    }
    
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "JN";

    return (
        <Sidenav initials={initials}>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile */}
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-green-700 text-white flex items-center justify-center text-4xl font-black shadow-lg">
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 mb-1">{user.name}</h1>
                        <p className="text-lg text-zinc-500 font-medium bg-zinc-100 px-3 py-1 rounded-lg inline-block">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Composant interactif pour les paramètres */}
                <AccountSettings 
                    user={{ id: user.id, name: user.name, email: user.email }} 
                    currentSessionId={session.session.id} 
                />
            </div>
        </Sidenav>
    );
}
