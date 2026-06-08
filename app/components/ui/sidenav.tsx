import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faCarrot, faHouse } from "@fortawesome/free-solid-svg-icons";

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: string | number;
}

function NavItem({ href, icon, label, badge }: NavItemProps) {
    return (
        <li>
            <Link
                href={href}
                className="flex items-center px-3 py-2.5 text-zinc-700 rounded-lg hover:bg-green-50 hover:text-green-700 group transition-colors"
            >
                <div className="w-5 h-5 text-zinc-500 transition duration-75 group-hover:text-green-700">
                    {icon}
                </div>
                <span className="flex-1 ms-3 whitespace-nowrap font-bold text-[15px]">{label}</span>
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
    return (

        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Navbar supérieure */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-zinc-200 shadow-sm">
                <div className="px-6 py-6 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                data-drawer-target="top-bar-sidebar"
                                data-drawer-toggle="top-bar-sidebar"
                                aria-controls="top-bar-sidebar"
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-zinc-500 rounded-lg sm:hidden hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                            >
                                <span className="sr-only">Ouvrir le menu</span>
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
                                </svg>
                            </button>
                            <Link href="/dashboard" className="flex items-center ms-2 md:me-24">
                                <img
                                    src="/images/logo.png"
                                    className="h-10 w-auto me-3 object-contain"
                                    alt="Fermes JN Beauchemin Logo"
                                />
                                <span className="self-center text-xl font-black whitespace-nowrap text-zinc-900 tracking-tight">
                                    Fermes JN Beauchemin
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center ms-3">
                                <button
                                    type="button"
                                    className="flex text-sm bg-green-700 rounded-full focus:ring-4 focus:ring-green-300"
                                    aria-expanded="false"
                                    data-dropdown-toggle="dropdown-user"
                                >
                                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                                    <div className="w-9 h-9 rounded-full bg-[#15803D] flex items-center justify-center text-white font-bold border-2 border-green-800 shadow-sm">
                                        JN
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar latérale */}
            <aside
                id="top-bar-sidebar"
                className="fixed top-0 left-0 z-40 w-64 h-full pt-20 transition-transform -translate-x-full bg-white border-r border-zinc-200 sm:translate-x-0 shadow-sm"
                aria-label="Sidebar"
            >
                <div className="h-full  px-4 pb-4 overflow-y-auto bg-white pt-10">
                    <ul className="space-y-1.5 font-medium">
                        <NavItem
                            href="/dashboard"
                            label="Tableau de bord"
                            icon={
                                <FontAwesomeIcon icon={faHouse} />
                            }
                        />
                        <NavItem
                            href="/inventaire"
                            label="Inventaire"
                            icon={
                                <FontAwesomeIcon icon={faDatabase} />
                            }
                        />
                        <NavItem
                            href="/ration"
                            label="Rations"
                            badge="Nouveau"
                            icon={
                                <FontAwesomeIcon icon={faCarrot} />
                            }
                        />
                    </ul>
                </div>
            </aside>

            {/* Contenu principal de la page */}
            <div className="p-4 sm:ml-64 pt-24 pb-8 min-h-screen">
                {children}
            </div>
        </div>
    );
}
