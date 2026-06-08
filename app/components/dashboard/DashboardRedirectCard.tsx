import Link from "next/link";
import React from "react";

export type CardColor = "green" | "yellow" | "blue" | "red" | "purple" | "orange" | "teal" | "indigo";

const colorStyles: Record<CardColor, { container: string; title: string; desc: string; hover: string; iconBg: string; iconText: string }> = {
    green: {
        container: "bg-white border-green-200",
        title: "text-green-900",
        desc: "text-green-700",
        hover: "hover:bg-green-50 hover:border-green-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
    },
    yellow: {
        container: "bg-white border-yellow-200",
        title: "text-yellow-900",
        desc: "text-yellow-700",
        hover: "hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-yellow-100",
        iconText: "text-yellow-600",
    },
    blue: {
        container: "bg-white border-blue-200",
        title: "text-blue-900",
        desc: "text-blue-700",
        hover: "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
    },
    red: {
        container: "bg-white border-red-200",
        title: "text-red-900",
        desc: "text-red-700",
        hover: "hover:bg-red-50 hover:border-red-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-red-100",
        iconText: "text-red-600",
    },
    purple: {
        container: "bg-white border-purple-200",
        title: "text-purple-900",
        desc: "text-purple-700",
        hover: "hover:bg-purple-50 hover:border-purple-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
    },
    orange: {
        container: "bg-white border-orange-200",
        title: "text-orange-900",
        desc: "text-orange-700",
        hover: "hover:bg-orange-50 hover:border-orange-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
    },
    teal: {
        container: "bg-white border-teal-200",
        title: "text-teal-900",
        desc: "text-teal-700",
        hover: "hover:bg-teal-50 hover:border-teal-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-teal-100",
        iconText: "text-teal-600",
    },
    indigo: {
        container: "bg-white border-indigo-200",
        title: "text-indigo-900",
        desc: "text-indigo-700",
        hover: "hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md hover:-translate-y-1",
        iconBg: "bg-indigo-100",
        iconText: "text-indigo-600",
    },
};

interface DashboardRedirectProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: CardColor;
}

export function DashboardRedirectCard({ href, icon, label, description, color }: DashboardRedirectProps) {
    const styles = colorStyles[color];

    return (
        <Link
            href={href}
            className={`p-8 rounded-[1.5rem] border-[1.5px] border-zinc-200/80 shadow-sm flex items-start gap-6 transition-all duration-300 ${styles.container} ${styles.hover}`}
        >
            <div className={`p-4 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl shadow-sm ${styles.iconBg} ${styles.iconText}`}>
                {icon}
            </div>
            <div className="flex flex-col text-left justify-center h-full pt-1">
                <h3 className={`font-black text-2xl leading-tight mb-2 ${styles.title}`}>{label}</h3>
                <p className={`text-base font-medium leading-snug ${styles.desc}`}>{description}</p>
            </div>
        </Link>
    );
}
