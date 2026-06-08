import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faCircleInfo, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface AlertProps {
    href: string;
    title: string;
    description: string;
}

export function AlertCard({ href, title, description }: AlertProps) {
    return (
        <Link href={href} className="group flex items-start gap-4 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-200 p-4 w-full">
            <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900 mb-0.5">{title}</h4>
                <p className="text-xs font-medium text-red-700">
                    {description}
                </p>
            </div>
            <div className="flex-shrink-0 text-red-400 group-hover:text-red-600 transition-colors flex items-center h-full">
                <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
            </div>
        </Link>
    );
}

export function MessageCard({ href, title, description }: AlertProps) {
    return (
        <Link href={href} className="group flex items-start gap-4 bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl border border-blue-200 p-4 w-full">
            <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon icon={faCircleInfo} className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-900 mb-0.5">{title}</h4>
                <p className="text-xs font-medium text-blue-700">
                    {description}
                </p>
            </div>
            <div className="flex-shrink-0 text-blue-400 group-hover:text-blue-600 transition-colors flex items-center h-full">
                <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
            </div>
        </Link>
    );
}
