import Sidenav from "@/app/components/ui/sidenav";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCarrot, faBuildingColumns, faWheatAwn, faSeedling, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { DashboardRedirectCard } from "@/app/components/dashboard/DashboardRedirectCard";
import { AlertCard, MessageCard } from "@/app/components/dashboard/NotificationCards";

export default function DashboardPage() {
    return (
        <Sidenav>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-zinc-900 mb-3 tracking-tight">Tableau de bord</h1>
                        <p className="text-lg text-zinc-500 font-medium max-w-2xl">
                            Bienvenue sur l'application de gestion des <strong className="text-green-700">Fermes JN Beauchemin</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Navigation Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2 px-1">
                            Modules principaux
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <DashboardRedirectCard
                                href="/inventaire"
                                icon={<FontAwesomeIcon icon={faBoxOpen} className="w-6 h-6" />}
                                label="Inventaire"
                                description="Gérez vos stocks, commandes et livraisons"
                                color="green"
                            />

                            <DashboardRedirectCard
                                href="/ration"
                                icon={<FontAwesomeIcon icon={faCarrot} className="w-6 h-6" />}
                                label="Rations"
                                description="Calculez et optimisez les rations alimentaires"
                                color="orange"
                            />

                            <DashboardRedirectCard
                                href="/comptabilite"
                                icon={<FontAwesomeIcon icon={faBuildingColumns} className="w-6 h-6" />}
                                label="Comptabilité"
                                description="Gérez les dépenses, revenus et factures"
                                color="indigo"
                            />

                            <DashboardRedirectCard
                                href="/aliments"
                                icon={<FontAwesomeIcon icon={faWheatAwn} className="w-6 h-6" />}
                                label="Aliments"
                                description="Manipulez les détails de chaque aliment"
                                color="blue"
                            />

                            <DashboardRedirectCard
                                href="/cultures"
                                icon={<FontAwesomeIcon icon={faSeedling} className="w-6 h-6" />}
                                label="Cultures"
                                description="Suivi des champs et rendements"
                                color="teal"
                            />

                            <DashboardRedirectCard
                                href="/rapports"
                                icon={<FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />}
                                label="Rapports"
                                description="Analyses et statistiques globales"
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Right Column: Notifications & Alerts */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2 px-1">
                            Alertes & Messages
                        </h2>

                        <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm p-6 space-y-4">
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

                            {/* Empty state example (can be hidden if there are alerts) */}
                            {/* <div className="text-center py-8">
                                <span className="text-4xl block mb-2 opacity-50">📭</span>
                                <p className="text-sm font-medium text-zinc-500">Aucune nouvelle alerte.</p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </Sidenav>
    );
}