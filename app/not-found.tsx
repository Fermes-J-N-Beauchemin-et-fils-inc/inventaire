"use client";

import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
            {/* Logo Section */}
            <div className="mb-12">
                <img
                    src="/images/logo.png"
                    alt="Fermes JN Beauchemin Logo"
                    className="w-32 h-auto md:w-40 mx-auto drop-shadow-md"
                />
            </div>

            {/* Content Section */}
            <div className="max-w-2xl bg-white/60 backdrop-blur-2xl border border-zinc-200/60 shadow-2xl shadow-zinc-200/50 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-[8rem] md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-green-700 to-green-500 leading-none tracking-tighter mb-4">
                        404
                    </h1>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-6 tracking-tight">
                        Oups ! Page introuvable.
                    </h2>
                    
                    <p className="text-lg md:text-xl font-medium text-zinc-500 mb-10 max-w-lg mx-auto">
                        Il semblerait que vous ayez pris un mauvais chemin. La page que vous recherchez n'existe pas ou a été déplacée.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href="/dashboard"
                            className="w-full sm:w-auto px-8 py-4 bg-green-700 hover:bg-green-800 text-white rounded-full font-bold text-lg shadow-lg shadow-green-700/30 transition-all hover:scale-105 flex items-center justify-center gap-3"
                        >
                            <FontAwesomeIcon icon={faHouse} className="w-5 h-5" />
                            Retour au tableau de bord
                        </Link>
                        
                        <button 
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
                            Page précédente
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-zinc-400 font-medium text-sm">
                &copy; {new Date().getFullYear()} Fermes JN Beauchemin. Tous droits réservés.
            </div>
        </div>
    );
}
