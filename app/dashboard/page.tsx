import Sidenav from "@/app/components/ui/sidenav";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCarrot, faBuildingColumns, faWheatAwn, faSeedling, faChartLine, faTruckFast, faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { DashboardRedirectCard } from "@/app/components/dashboard/DashboardRedirectCard";
import { AlertCard, MessageCard } from "@/app/components/dashboard/NotificationCards";
import RationProgressWidget from "@/app/components/dashboard/RationProgressWidget";
import DeliveryWidget from "@/app/components/dashboard/DeliveryWidget";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // 1. Fetching the session server-side securely
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/api/auth/clear-local");
    }

    if ((session.user as any).role === "distributor") {
        redirect("/ration");
    }

    // Getting the user's name
    const userName = session?.user?.name || "Utilisateur";
    const userInitials = session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "JN";

    return (
        <Sidenav initials={userInitials}>
            <div className="max-w-[1400px] mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                    <div>
                        <div className="mb-2 inline-block px-4 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-sm font-black tracking-widest uppercase shadow-sm">
                            {new Date().toLocaleDateString('fr-CA', { timeZone: 'America/Toronto', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4 mt-2">
                            Hello, {userName}
                        </h1>
                        <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
                            Voici un aperçu de vos activités de la journée.
                        </p>
                    </div>
                </div>

                {/* Section 1: Alertes & Messages */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                            Alertes & Messages
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AlertCard
                            href="/inventaire"
                            title="Stock de maïs bas !"
                            description="Il reste moins de 500kg de maïs grain. Veuillez planifier une commande rapidement."
                        />
                        <MessageCard
                            href="/ration"
                            title="Mise à jour des prix"
                            description="Les prix des suppléments protéiques ont été mis à jour ce matin par le fournisseur."
                        />
                    </div>
                </section>

                {/* Section 2: Widgets Apple-like */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                            Aperçu Rapide
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Ration Progress Widget */}
                        <RationProgressWidget />

                        {/* Upcoming Deliveries Widget */}
                        <DeliveryWidget />
                    </div>
                </section>

                {/* Section 3: Applications / Modules */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                            Applications
                        </h2>
                    </div>

                    <div className="space-y-12">
                        {/* Grains Section */}
                        
                        <div>
                            <h3 className="text-lg font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faWheatAwn} /> Grains
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <DashboardRedirectCard
                                    href="/grains/aliments"
                                    icon={<FontAwesomeIcon icon={faWheatAwn} className="w-6 h-6" />}
                                    label="Aliments"
                                    description="Analyses nut."
                                    color="amber"
                                />
                                <DashboardRedirectCard
                                    href="/grains/inventaire"
                                    icon={<FontAwesomeIcon icon={faBoxOpen} className="w-6 h-6" />}
                                    label="Inventaire"
                                    description="Gérez les silos"
                                    color="amber"
                                />
                                <DashboardRedirectCard
                                    href="/grains/rations"
                                    icon={<FontAwesomeIcon icon={faCarrot} className="w-6 h-6" />}
                                    label="Rations"
                                    description="Calcul & dist."
                                    color="amber"
                                />
                                <DashboardRedirectCard
                                    href="/grains/transactions"
                                    icon={<FontAwesomeIcon icon={faArrowRightArrowLeft} className="w-6 h-6" />}
                                    label="Transactions"
                                    description="Chaîne d'app."
                                    color="amber"
                                />
                            </div>
                        </div>

                        {/* Laitier Section */}
                        <div>
                            <h3 className="text-lg font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} /> Laitier
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <DashboardRedirectCard
                                    href="/laitier/nutrition"
                                    icon={<FontAwesomeIcon icon={faSeedling} className="w-6 h-6" />}
                                    label="Nutrition"
                                    description="Suivi laitier"
                                    color="blue"
                                />
                                <DashboardRedirectCard
                                    href="/laitier/transactions"
                                    icon={<FontAwesomeIcon icon={faTruckFast} className="w-6 h-6" />}
                                    label="Transactions"
                                    description="Laitières"
                                    color="blue"
                                />
                                
                                <DashboardRedirectCard
                                    href="/laitier/sommaire"
                                    icon={<FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />}
                                    label="Sommaire"
                                    description="Troupeau"
                                    color="blue"
                                />
                            </div>
                        </div>
                        

                        {/* Comptabilite Section */}
                        <div>
                            <h3 className="text-lg font-black text-teal-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuildingColumns} /> Comptabilité
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <DashboardRedirectCard
                                    href="/comptabilite/rations"
                                    icon={<FontAwesomeIcon icon={faCarrot} className="w-6 h-6" />}
                                    label="Rations"
                                    description="Coûts"
                                    color="teal"
                                />
                                <DashboardRedirectCard
                                    href="/comptabilite/laitier"
                                    icon={<FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />}
                                    label="Laitier"
                                    description="Revenus"
                                    color="teal"
                                />
                                <DashboardRedirectCard
                                    href="/comptabilite/globale"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} className="w-6 h-6" />}
                                    label="Globale"
                                    description="Aperçu global"
                                    color="teal"
                                />
                                <DashboardRedirectCard
                                    href="/comptabilite/archives"
                                    icon={<FontAwesomeIcon icon={faBoxOpen} className="w-6 h-6" />}
                                    label="Archives"
                                    description="Historique"
                                    color="teal"
                                />
                                <DashboardRedirectCard
                                    href="/comptabilite/metrics"
                                    icon={<FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />}
                                    label="Métriques"
                                    description="Indicateurs"
                                    color="teal"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Sidenav>
    );
}