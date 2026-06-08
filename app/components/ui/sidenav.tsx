"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faCarrot, faHouse, faBuildingColumns, faWheatAwn, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: string | number;
    onClick?: () => void;
}

function NavItem({ href, icon, label, badge, onClick }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive 
                        ? "bg-green-100 text-green-900 font-black" 
                        : "text-zinc-700 hover:bg-green-50 hover:text-green-700"
                }`}
            >
                <div className={`w-5 h-5 transition duration-75 ${
                    isActive ? "text-green-800" : "text-zinc-500 group-hover:text-green-700"
                }`}>
                    {icon}
                </div>
                <span className={`flex-1 ms-3 whitespace-nowrap text-[15px] ${isActive ? "font-black" : "font-bold"}`}>
                    {label}
                </span>
                {badge && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-black text-green-800 bg-green-100 rounded-full border border-green-200">
                        {badge}
                    </span>
                )}
            </Link>
        </li>
    );
}


export default function Sidenav({ children }: { children?: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Navbar supérieure */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-zinc-200 shadow-sm">
                <div className="px-6 py-4 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar}
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-zinc-500 rounded-lg sm:hidden hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                            >
                                <span className="sr-only">Ouvrir le menu</span>
                                <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} className="w-6 h-6" />
                            </button>
                            <Link href="/dashboard" className="flex items-center ms-2 md:me-24">
                                <img
                                    src="/images/logo.png"
                                    className="h-10 w-auto me-3 object-contain"
                                    alt="Fermes JN Beauchemin Logo"
                                />
                                <span className="self-center text-xl font-black whitespace-nowrap text-zinc-900 tracking-tight hidden md:block">
                                    Fermes JN Beauchemin
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center ms-3">
                                <button
                                    type="button"
                                    className="flex text-sm bg-green-700 rounded-full focus:ring-4 focus:ring-green-300"
                                >
                                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                                    <div className="w-10 h-10 rounded-full bg-[#15803D] flex items-center justify-center text-white font-bold border-2 border-green-800 shadow-sm">
                                        JN
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Overlay pour fermer le menu sur mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-zinc-900/50 backdrop-blur-sm sm:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar latérale */}
            <aside
                className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 transition-transform bg-white border-r border-zinc-200 shadow-sm ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-4 pb-4 overflow-y-auto bg-white pt-6">
                    <ul className="space-y-1.5 font-medium">
                        <NavItem
                            href="/dashboard"
                            label="Tableau de bord"
                            icon={<FontAwesomeIcon icon={faHouse} />}
                            onClick={closeSidebar}
                        />
                        <NavItem
                            href="/inventaire"
                            label="Inventaire"
                            icon={<FontAwesomeIcon icon={faDatabase} />}
                            onClick={closeSidebar}
                        />
                        <NavItem
                            href="/ration"
                            label="Rations"
                            badge="Nouveau"
                            icon={<FontAwesomeIcon icon={faCarrot} />}
                            onClick={closeSidebar}
                        />
                        <NavItem
                            href="/comptabilite"
                            label="Comptabilité"
                            icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                            onClick={closeSidebar}
                        />
                        <NavItem
                            href="/aliments"
                            label="Aliments"
                            icon={<FontAwesomeIcon icon={faWheatAwn} />}
                            onClick={closeSidebar}
                        />
                    </ul>
                </div>
            </aside>

            {/* Contenu principal de la page */}
            <div className="p-4 sm:ml-64 pt-24 pb-8 min-h-screen flex flex-col justify-between">
                <div>
                    {children}
                </div>
                
                {/* Petit footer */}
                <footer className="mt-auto pt-8 pb-4 text-center text-zinc-500 text-sm font-medium">
                    &copy; {new Date().getFullYear()} Fermes JN Beauchemin. Tous droits réservés.
                </footer>
            </div>
        </div>
    );
}
