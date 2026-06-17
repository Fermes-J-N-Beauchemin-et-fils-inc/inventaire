import Sidenav from "@/app/components/ui/sidenav";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCarrot, faBuildingColumns, faWheatAwn, faSeedling, faChartLine, faTruckFast, faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import { DashboardRedirectCard } from "@/app/components/dashboard/DashboardRedirectCard";
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

    // 2. Fetching upcoming deliveries from DB
    const upcomingDeliveries = await prisma.delivery.findMany({
        where: { date_expected: { gte: new Date() }, date_delivered: new Date("2099-12-31") },
        include: { food: true, contract: { include: { supplier: true } } },
        orderBy: { date_expected: 'asc' },
        take: 4
    });

    // 3. Simulated Ration Progress Data
    const rationDone = false; // "En cours"
    const groupsTotal = 4;
    const groupsDone = 3;
    const rationProgressPercent = (groupsDone / groupsTotal) * 100;

    return (
        <Sidenav initials={userInitials}>
            <div className="max-w-[1400px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="mb-2 inline-block px-4 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-sm font-black tracking-widest uppercase shadow-sm">
                            {new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4 mt-2">
                            Bonjour, {userName}
                        </h1>
                        <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
                            Voici un aperçu de vos activités de la journée.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column: Widgets (Apple-like) */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2 px-2">
                            Aperçu Rapide
                        </h2>

                        {/* Ration Progress Widget */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-6 flex flex-col justify-between transition-all hover:scale-[1.01]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-black text-lg text-zinc-900">Progression de la Ration</h3>
                                    <p className="text-sm font-bold text-zinc-400 mt-1">Aujourd'hui</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${rationDone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <FontAwesomeIcon icon={rationDone ? faCheckCircle : faClock} className="text-2xl" />
                                </div>
                            </div>

                            {rationDone ? (
                                <div className="text-center py-4">
                                    <p className="text-2xl font-black text-green-600">Ration Terminée</p>
                                    <p className="text-sm font-bold text-zinc-500 mt-2">Tous les groupes ont été nourris.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-4xl font-black text-zinc-900">{groupsDone}<span className="text-2xl text-zinc-400">/{groupsTotal}</span></span>
                                        <span className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">En cours</span>
                                    </div>
                                    <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden mt-4 shadow-inner">
                                        <div 
                                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${rationProgressPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-500 mt-3 text-center">{groupsDone} groupes nourris sur {groupsTotal}</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Deliveries Widget */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-6 transition-all hover:scale-[1.01]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-zinc-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTruckFast} className="text-blue-500" /> Livraisons à venir
                                </h3>
                                <Link href="/fournisseurs" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Voir tout</Link>
                            </div>

                            {upcomingDeliveries.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingDeliveries.map((delivery) => {
                                        const daysDiff = Math.ceil((new Date(delivery.date_expected).getTime() - Date.now()) / (1000 * 3600 * 24));
                                        return (
                                            <div key={delivery.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[1rem] flex items-center justify-center font-black text-lg shrink-0 shadow-sm border border-indigo-100/50">
                                                    {delivery.contract.supplier.name.substring(0, 1)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-zinc-900 truncate">{delivery.food.name}</p>
                                                    <p className="text-xs font-bold text-zinc-500 truncate">{delivery.contract.supplier.name} • {delivery.quantity_received.toLocaleString()} kg</p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className={`text-xs font-black px-2 py-1 rounded-md ${daysDiff <= 1 ? 'bg-red-50 text-red-600' : daysDiff <= 3 ? 'bg-orange-50 text-orange-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                                        {daysDiff === 0 ? "Auj." : daysDiff === 1 ? "Demain" : `Dans ${daysDiff}j`}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed">
                                    <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FontAwesomeIcon icon={faBoxOpen} />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-500">Aucune livraison prévue</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Main Navigation Cards */}
                    <div className="xl:col-span-2 space-y-8">
                        <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2 px-2">
                            Applications
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DashboardRedirectCard
                                href="/inventaire"
                                icon={<FontAwesomeIcon icon={faBoxOpen} className="w-8 h-8" />}
                                label="Inventaire"
                                description="Gérez vos stocks et l'état des silos en temps réel"
                                color="green"
                            />

                            <DashboardRedirectCard
                                href="/ration"
                                icon={<FontAwesomeIcon icon={faCarrot} className="w-8 h-8" />}
                                label="Rations"
                                description="Calculez et distribuez la ration aux animaux"
                                color="orange"
                            />

                            <DashboardRedirectCard
                                href="/fournisseurs"
                                icon={<FontAwesomeIcon icon={faTruckFast} className="w-8 h-8" />}
                                label="Fournisseurs & Contrats"
                                description="Chaîne d'approvisionnement et livraisons"
                                color="indigo"
                            />

                            <DashboardRedirectCard
                                href="/aliments"
                                icon={<FontAwesomeIcon icon={faWheatAwn} className="w-8 h-8" />}
                                label="Aliments"
                                description="Analyses nutritionnelles et détails"
                                color="blue"
                            />

                            <DashboardRedirectCard
                                href="/comptabilite"
                                icon={<FontAwesomeIcon icon={faBuildingColumns} className="w-8 h-8" />}
                                label="Comptabilité"
                                description="Factures, dépenses et états financiers"
                                color="teal"
                            />

                            <DashboardRedirectCard
                                href="/rapports"
                                icon={<FontAwesomeIcon icon={faChartLine} className="w-8 h-8" />}
                                label="Rapports"
                                description="Analyses et statistiques de la ferme"
                                color="purple"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </Sidenav>
    );
}