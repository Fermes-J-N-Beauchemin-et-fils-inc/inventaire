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
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all group ${
                    isActive 
                        ? "bg-green-100 text-green-900 shadow-sm" 
                        : "text-zinc-700 hover:bg-green-50 hover:text-green-800"
                }`}
            >
                <div className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? "text-green-800 scale-110" : "text-zinc-500 group-hover:text-green-700 group-hover:scale-110"
                }`}>
                    {icon}
                </div>
                <span className={`flex-1 ms-4 whitespace-nowrap text-lg tracking-tight ${isActive ? "font-black" : "font-bold"}`}>
                    {label}
                </span>
                {badge && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-sm font-black text-green-800 bg-green-100 rounded-full border border-green-200 shadow-sm">
                        {badge}
                    </span>
                )}
            </Link>
        </li>
    );
}

interface SidenavProps {
    children?: React.ReactNode;
    initials?: string;
}

export default function Sidenav({ children, initials = "JN" }: SidenavProps) {
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
                <div className="px-6 py-6 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar}
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-zinc-500 rounded-lg sm:hidden hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                            >
                                <span className="sr-only">Ouvrir le menu</span>
                                <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} className="w-7 h-7" />
                            </button>
                            <Link href="/dashboard" className="flex items-center ms-2 md:me-24 group">
                                <img
                                    src="/images/logo.png"
                                    className="h-20 w-auto me-4 object-contain group-hover:scale-105 transition-transform"
                                    alt="Fermes JN Beauchemin Logo"
                                />
                                <span className="self-center text-3xl font-black whitespace-nowrap text-zinc-900 tracking-tight hidden md:block group-hover:text-green-800 transition-colors">
                                    Fermes JN Beauchemin
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center ms-3">
                                <Link
                                    href="/compte"
                                    className="flex text-sm bg-green-700 rounded-full focus:ring-4 focus:ring-green-300 hover:ring-4 hover:ring-green-100 transition-all hover:scale-105"
                                    title="Paramètres du compte"
                                >
                                    <span className="sr-only">Accéder aux paramètres du compte</span>
                                    <div className="w-14 h-14 rounded-full bg-[#15803D] flex items-center justify-center text-white text-xl font-black border-[3px] border-green-800 shadow-md tracking-widest">
                                        {initials}
                                    </div>
                                </Link>
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
                className={`fixed top-0 left-0 z-40 w-80 h-full pt-[7.5rem] transition-transform bg-white border-r border-zinc-200 shadow-sm ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-5 pb-4 overflow-y-auto bg-white pt-6">
                    <ul className="space-y-2 font-medium">
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
            <div className="p-6 sm:ml-80 pt-[8.5rem] pb-8 min-h-screen flex flex-col justify-between">
                <div>
                    {children}
                </div>
                
                {/* Petit footer */}
                <footer className="mt-auto pt-10 pb-4 text-center text-zinc-500 text-sm font-medium">
                    &copy; {new Date().getFullYear()} Fermes JN Beauchemin. Tous droits réservés.
                </footer>
            </div>
        </div>
    );
}
