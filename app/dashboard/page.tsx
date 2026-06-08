import Sidenav from "@/app/components/ui/sidenav";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCarrot, faBuildingColumns, faWheatAwn, faSeedling, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { DashboardRedirectCard } from "@/app/components/dashboard/DashboardRedirectCard";
import { AlertCard, MessageCard } from "@/app/components/dashboard/NotificationCards";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    // 1. Fetching the session server-side securely
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/api/auth/clear-local");
    }

    // Getting the user's name, fallback to 'Utilisateur' if something fails
    const userName = session?.user?.name || "Utilisateur";
    const userInitials = session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "JN";

    return (
        <Sidenav initials={userInitials}>
            <div className="max-w-[1400px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-200/60 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-6xl font-black text-zinc-900 mb-4 tracking-tight">Bonjour, {userName} </h1>
                        <p className="text-xl text-zinc-500 font-medium max-w-3xl leading-relaxed">
                            Bienvenue sur votre tableau de bord.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column: Main Navigation Cards */}
                    <div className="xl:col-span-2 space-y-8">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2 px-2">
                            Modules principaux
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DashboardRedirectCard
                                href="/inventaire"
                                icon={<FontAwesomeIcon icon={faBoxOpen} className="w-8 h-8" />}
                                label="Inventaire"
                                description="Gérez vos stocks, commandes et livraisons"
                                color="green"
                            />

                            <DashboardRedirectCard
                                href="/ration"
                                icon={<FontAwesomeIcon icon={faCarrot} className="w-8 h-8" />}
                                label="Rations"
                                description="Calculez et optimisez les rations alimentaires"
                                color="orange"
                            />

                            <DashboardRedirectCard
                                href="/comptabilite"
                                icon={<FontAwesomeIcon icon={faBuildingColumns} className="w-8 h-8" />}
                                label="Comptabilité"
                                description="Gérez les dépenses, revenus et factures"
                                color="indigo"
                            />

                            <DashboardRedirectCard
                                href="/aliments"
                                icon={<FontAwesomeIcon icon={faWheatAwn} className="w-8 h-8" />}
                                label="Aliments"
                                description="Manipulez les détails de chaque aliment"
                                color="blue"
                            />

                            <DashboardRedirectCard
                                href="/cultures"
                                icon={<FontAwesomeIcon icon={faSeedling} className="w-8 h-8" />}
                                label="Cultures"
                                description="Suivi des champs et rendements"
                                color="teal"
                            />

                            <DashboardRedirectCard
                                href="/rapports"
                                icon={<FontAwesomeIcon icon={faChartLine} className="w-8 h-8" />}
                                label="Rapports"
                                description="Analyses et statistiques globales"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Right Column: Notifications & Alerts */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2 px-2">
                            Alertes & Messages
                        </h2>

                        <div className="bg-white rounded-[2.5rem] border border-zinc-200/60 shadow-sm p-8 space-y-5">
                            {/* You could conditionally render these based on data */}
                            <AlertCard
                                href="/inventaire"
                                title="Stock de maïs bas !"
                                description="Il reste moins de 500kg de maïs grain. Veuillez planifier une commande."
                            />

                            <MessageCard
                                href="/ration"
                                title="Mise à jour des prix"
                                description="Les prix des suppléments protéiques ont été mis à jour ce matin."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Sidenav>
    );
}