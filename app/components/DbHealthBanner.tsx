"use client";

import { useDbHealth } from "./providers/DbHealthProvider";

export function DbHealthBanner() {
  const { isDbDown } = useDbHealth();

  if (!isDbDown) return null;

  return (
    <div className="w-full bg-red-600 text-white px-4 py-3 flex items-start sm:items-center justify-between shadow-md z-50 sticky top-0 border-b-4 border-red-800">
      <div className="flex items-start sm:items-center gap-3 w-full">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-white mt-0.5 sm:mt-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
        <div className="flex flex-col">
          <strong className="font-bold text-base sm:text-lg tracking-wide upercase">
            Panne de connexion à la base de données
          </strong>
          <span className="text-sm sm:text-base font-medium opacity-90">
            La connexion à notre serveur de données est temporairement interrompue. 
            Les consultations restent possibles si elles ont déjà été chargées, mais <strong>toutes les modifications et sauvegardes sont désactivées</strong> pour éviter la perte de données. Veuillez réessayer dans quelques minutes.
          </span>
        </div>
      </div>
    </div>
  );
}
