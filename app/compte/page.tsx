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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30 text-2xl font-black">
                                {initials}
                            </div>
                            {user.name}
                        </h1>
                        <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
                            Paramètres du compte • <span className="text-blue-600 font-bold underline">{user.email}</span>
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
