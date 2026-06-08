import Sidenav from "@/app/components/ui/sidenav";
import Link from "next/link";
import React from "react";

export type CardColor = "green" | "yellow" | "blue" | "red";


const colorStyles: Record<CardColor, { container: string; title: string; desc: string; hover: string }> = {
    green: {
        container: "bg-green-50 border-green-200",
        title: "text-green-900",
        desc: "text-green-700",
        hover: "hover:bg-green-100 hover:border-green-300 hover:-translate-y-1",
    },
    yellow: {
        container: "bg-yellow-50 border-yellow-200",
        title: "text-yellow-900",
        desc: "text-yellow-700",
        hover: "hover:bg-yellow-100 hover:border-yellow-300 hover:-translate-y-1",
    },
    blue: {
        container: "bg-blue-50 border-blue-200",
        title: "text-blue-900",
        desc: "text-blue-700",
        hover: "hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-1",
    },
    red: {
        container: "bg-red-50 border-red-200",
        title: "text-red-900",
        desc: "text-red-700",
        hover: "hover:bg-red-100 hover:border-red-300 hover:-translate-y-1",
    },
};

// 3. Add the 'color' prop to your interface
interface DashboardRedirectProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: CardColor; // Ensure it only accepts our defined colors
}

// 4. The Reusable Component
function DashboardRedirectCard({ href, icon, label, description, color }: DashboardRedirectProps) {
    // Lookup the correct styles based on the passed color
    const styles = colorStyles[color];

    return (
        <Link
            href={href}
            className={`p-6 rounded-xl border-2 shadow-sm flex flex-col items-center justify-center min-h-[160px] transition-all duration-200 ${styles.container} ${styles.hover}`}
        >
            <span className="text-4xl mb-3">{icon}</span>
            <h3 className={`font-bold text-lg ${styles.title}`}>{label}</h3>
            <p className={`text-sm text-center mt-1 ${styles.desc}`}>{description}</p>
        </Link>
    );
}

// 5. The Main Page
export default function DashboardPage() {
    return (
        <Sidenav>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200">
                <h1 className="text-3xl font-black text-zinc-900 mb-2">Tableau de bord</h1>
                <p className="text-zinc-600 font-medium mb-6">
                    Bienvenue sur l'application de gestion des Fermes JN Beauchemin.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {/* Using the component with different colors! */}
                    <DashboardRedirectCard
                        href="/inventaire"
                        icon="📦"
                        label="Inventaire"
                        description="Gérez vos stocks et commandes"
                        color="green"
                    />

                    <DashboardRedirectCard
                        href="/ration"
                        icon="🐄"
                        label="Rations"
                        description="Calculez les rations alimentaires"
                        color="yellow"
                    />

                    <DashboardRedirectCard
                        href="/ration"
                        icon="🏛️"
                        label="Comptabilité"
                        description="Gérez les dépenses et revenus"
                        color="blue"
                    />
                </div>
            </div>
        </Sidenav>
    );
}