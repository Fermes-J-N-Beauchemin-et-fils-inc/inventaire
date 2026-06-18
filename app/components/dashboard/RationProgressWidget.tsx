"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function RationProgressWidget() {
    const [pushedRation, setPushedRation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRation = async () => {
            try {
                const res = await fetch('/api/ration/active');
                if (res.ok) {
                    const data = await res.json();
                    setPushedRation(data.activeRation);
                }
            } catch (err) {
                console.error("Failed to fetch ration progress", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRation();
        const interval = setInterval(fetchRation, 3000); // 3 seconds hot reload
        return () => clearInterval(interval);
    }, []);

    const isRationPushed = !!pushedRation;
    const rationDone = pushedRation ? pushedRation.status === "TERMINEE" : false;
    const groupsTotal = pushedRation ? pushedRation.groups_total : 0;
    const groupsDone = pushedRation ? pushedRation.groups_done : 0;
    const rationProgressPercent = groupsTotal > 0 ? (groupsDone / groupsTotal) * 100 : 0;

    return (
        <Link href="/ration" className="block bg-white/80 backdrop-blur-xl rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[250px]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-black text-2xl text-zinc-900">Progression de la Ration</h3>
                    <p className="text-base font-medium text-zinc-500 mt-2">
                        Suivez l'état de la distribution de la ration pour l'ensemble des groupes d'animaux aujourd'hui.
                    </p>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner shrink-0 ${rationDone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <FontAwesomeIcon icon={rationDone ? faCheckCircle : faClock} className="text-3xl" />
                </div>
                    
            </div>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <p className="text-xl font-bold text-zinc-400 animate-pulse">Chargement...</p>
                </div>
            ) : !isRationPushed ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <p className="text-3xl font-black text-zinc-400">Non poussée</p>
                    <p className="text-base font-bold text-zinc-400 mt-2">La ration d'aujourd'hui n'est pas encore prête.</p>
                </div>
            ) : rationDone ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <p className="text-3xl font-black text-green-600">Distribution finie pour aujourd'hui</p>
                    <p className="text-base font-bold text-zinc-500 mt-2">Tous les groupes ont été nourris.</p>
                </div>
            ) : (
                <div className="mt-auto">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-5xl font-black text-zinc-900">{groupsDone}<span className="text-3xl text-zinc-400">/{groupsTotal}</span></span>
                        <span className="text-sm font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-full uppercase tracking-widest">En cours</span>
                    </div>
                    <div className="w-full h-5 bg-zinc-100 rounded-full overflow-hidden mt-4 shadow-inner">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ width: `${rationProgressPercent}%` }}
                        />
                    </div>
                    <p className="text-sm font-bold text-zinc-500 mt-4 text-center">{groupsDone} groupes nourris sur {groupsTotal}</p>
                </div>
            )}
        </Link>
    );
}
