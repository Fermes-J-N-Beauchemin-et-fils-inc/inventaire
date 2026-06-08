import React from 'react';
import Link from 'next/link';

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
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                            }
                        />
                        <NavItem
                            href="/inventaire"
                            label="Inventaire"
                            icon={
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                    <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                                </svg>
                            }
                        />
                        <NavItem
                            href="/ration"
                            label="Rations"
                            badge="Nouveau"
                            icon={
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                                    <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                                    <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                                </svg>
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
