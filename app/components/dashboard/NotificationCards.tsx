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
        <Link href={href} className="group flex items-start gap-5 bg-red-50 hover:bg-red-100 transition-colors rounded-2xl border border-red-200 p-5 w-full">
            <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-black text-red-900 mb-1">{title}</h4>
                <p className="text-sm font-medium text-red-700 leading-snug">
                    {description}
                </p>
            </div>
            <div className="flex-shrink-0 text-red-400 group-hover:text-red-600 transition-colors flex items-center h-full">
                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </div>
        </Link>
    );
}

export function MessageCard({ href, title, description }: AlertProps) {
    return (
        <Link href={href} className="group flex items-start gap-5 bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl border border-blue-200 p-5 w-full">
            <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon icon={faCircleInfo} className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-black text-blue-900 mb-1">{title}</h4>
                <p className="text-sm font-medium text-blue-700 leading-snug">
                    {description}
                </p>
            </div>
           
            <div className="flex-shrink-0 text-blue-400 group-hover:text-blue-600 transition-colors flex items-center h-full">
                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </div>
        </Link>
    );
}
