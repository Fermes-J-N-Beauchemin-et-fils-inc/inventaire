import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckFast, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { prisma } from "@/app/lib/db";

export default async function DeliveryWidget() {
    // Fetch upcoming deliveries from DB
    const upcomingDeliveries = await prisma.delivery.findMany({
        where: { date_expected: { gte: new Date() } },
        include: { food: true, supplier: true },
        orderBy: { date_expected: 'asc' },
        take: 3
    });

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 transition-all hover:scale-[1.01] min-h-[250px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-black text-2xl text-zinc-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                            <FontAwesomeIcon icon={faTruckFast} />
                        </div>
                        Prochaines Livraisons
                    </h3>
                    <p className="text-base font-medium text-zinc-500 mt-2">
                        Aperçu des 3 prochaines réceptions d'aliments planifiées selon vos contrats.
                    </p>
                </div>
                <Link href="/fournisseurs" className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors shrink-0">
                    Voir tout
                </Link>
            </div>

            <div className="flex-1 overflow-hidden mt-2"> 
                {upcomingDeliveries.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingDeliveries.map((delivery: any) => {
                            const daysDiff = Math.ceil((new Date(delivery.date_expected).getTime() - Date.now()) / (1000 * 3600 * 24));
                            return (
                                <div key={delivery.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200 bg-white shadow-sm">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.2rem] flex items-center justify-center font-black text-xl shrink-0 shadow-sm border border-indigo-100/50">
                                        {delivery.supplier?.name?.substring(0, 1) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-zinc-900 truncate">{delivery.food.name}</p>
                                        <p className="text-sm font-bold text-zinc-500 truncate">{delivery.supplier?.name || 'Inconnu'} • {delivery.quantity_received.toLocaleString()} kg</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className={`text-sm font-black px-3 py-1.5 rounded-lg ${daysDiff <= 1 ? 'bg-red-50 text-red-600' : daysDiff <= 3 ? 'bg-orange-50 text-orange-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {daysDiff === 0 ? "Auj." : daysDiff === 1 ? "Demain" : `Dans ${daysDiff}j`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 rounded-2xl border border-zinc-200 border-dashed">
                        <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />
                        </div>
                        <p className="text-lg font-bold text-zinc-600">Aucune livraison prévue</p>
                        <p className="text-sm font-medium text-zinc-400 mt-1">Vos silos sont pleins ou aucun contrat n'est actif.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
