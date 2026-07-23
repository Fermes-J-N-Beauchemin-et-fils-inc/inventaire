"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faCarrot, faHouse, faBuildingColumns, faWheatAwn, faBars, faXmark, faTruck, faFlask, faStore, faArrowRightArrowLeft, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';

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
            <nav 
                className="fixed top-0 z-[60] w-full bg-white border-b border-zinc-200 shadow-sm print:hidden"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="px-6 py-6 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar}
                                type="button"
                                className="inline-flex items-center justify-center p-3 w-12 h-12 text-zinc-600 rounded-xl hover:bg-zinc-100 hover:text-black focus:outline-none focus:ring-4 focus:ring-zinc-200 transition-all lg:hidden"
                            >
                                <span className="sr-only">Ouvrir le menu</span>
                                <FontAwesomeIcon icon={isSidebarOpen ? faXmark : faBars} className="w-8 h-8" />
                            </button>
                            <Link href="/dashboard" className="flex items-center ms-4 md:me-24 group">
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

            {/* Overlay pour fermer le menu sur mobile (uniquement visible quand ouvert et ecran petit) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-[50] bg-zinc-900/50 backdrop-blur-sm lg:hidden transition-opacity print:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar latérale */}
            <aside
                className={`fixed top-0 left-0 z-[55] w-80 h-full pt-[7.5rem] transition-transform duration-300 ease-in-out bg-white border-r border-zinc-200 shadow-sm print:hidden lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Sidebar"
            >
                <div className="h-full px-5 pb-4 overflow-y-auto bg-white pt-6">
                    <div className="space-y-6">
                        {/* Section: Tableau de bord */}
                        <ul className="space-y-2 font-medium">
                            <NavItem
                                href="/dashboard"
                                label="Tableau de bord"
                                icon={<FontAwesomeIcon icon={faHouse} />}
                            />
                        </ul>

                        {/* Section: Grains */}
                        <div>
                            <h3 className="px-4 text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Grains</h3>
                            <ul className="space-y-2 font-medium">
                                <NavItem
                                    href="/grains/aliments"
                                    label="Aliments"
                                    icon={<FontAwesomeIcon icon={faWheatAwn} />}
                                />
                                <NavItem
                                    href="/grains/inventaire"
                                    label="Inventaire"
                                    icon={<FontAwesomeIcon icon={faDatabase} />}
                                />
                                <NavItem
                                    href="/grains/rations"
                                    label="Rations"
                                    icon={<FontAwesomeIcon icon={faCarrot} />}
                                />
                                <NavItem
                                    href="/grains/transactions"
                                    label="Transactions"
                                    icon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
                                />
                            </ul>
                        </div>

                        {/* Section: Laitier */}
                        <div>
                            <h3 className="px-4 text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Laitier</h3>
                            <ul className="space-y-2 font-medium">
                                <NavItem
                                    href="/laitier/nutrition"
                                    label="Nutrition"
                                    icon={<FontAwesomeIcon icon={faFlask} />}
                                />
                                <NavItem
                                    href="/laitier/groupements"
                                    label="Groupements"
                                    icon={<FontAwesomeIcon icon={faLayerGroup} />}
                                />
                                <NavItem
                                    href="/laitier/transactions"
                                    label="Transactions laitières"
                                    icon={<FontAwesomeIcon icon={faTruck} />}
                                />
                                <NavItem
                                    href="/laitier/sommaire"
                                    label="Sommaire du troupeau"
                                    icon={<FontAwesomeIcon icon={faHouse} />} // Or any suitable icon
                                />
                            </ul>
                        </div>

                        {/* Section: Comptabilité */}
                        <div>
                            <h3 className="px-4 text-xs font-black text-teal-500 uppercase tracking-widest mb-3">Comptabilité</h3>
                            <ul className="space-y-2 font-medium">
                                <NavItem
                                    href="/comptabilite/rations"
                                    label="Rations"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                                />
                                <NavItem
                                    href="/comptabilite/laitier"
                                    label="Laitier"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                                />
                                <NavItem
                                    href="/comptabilite/globale"
                                    label="Globale"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                                />
                                <NavItem
                                    href="/comptabilite/archives"
                                    label="Archives"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                                />
                                <NavItem
                                    href="/comptabilite/metrics"
                                    label="Métriques"
                                    icon={<FontAwesomeIcon icon={faBuildingColumns} />}
                                />
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Contenu principal de la page */}
            <div className={`p-6 pt-[8.5rem] pb-8 min-h-screen flex flex-col justify-between transition-all duration-300 print:p-0 print:m-0 print:min-h-0 print:w-full ml-0 lg:ml-80`}>
                <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-full"
                >
                    {children}
                </motion.div>
                
                {/* Petit footer */}
                <footer className="mt-auto pt-10 pb-4 text-center text-zinc-500 text-sm font-medium print:hidden">
                    &copy; {new Date().getFullYear()} Fermes JN Beauchemin. Tous droits réservés.
                </footer>
            </div>
        </div>
    );
}
