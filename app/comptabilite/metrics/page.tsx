import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faScaleBalanced, faSeedling, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function MetricsComptabilitePage() {
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 text-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                <FontAwesomeIcon icon={faChartPie} />
              </div>
              Indicateurs de Performance
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              Suivez vos KPIs clés: Efficacité alimentaire et évolution des coûts de matière sèche.
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
            </div>
            <select className="block w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-base font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all shadow-sm cursor-pointer appearance-none">
              <option>Juin 2026</option>
              <option>Mai 2026</option>
              <option>Avril 2026</option>
            </select>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: Efficacité Alimentaire */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Efficacité Alimentaire</h3>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-zinc-900 tracking-tight">1.48</p>
              <span className="text-lg font-bold text-zinc-400 mb-1">L/kg MS</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200">Stable</span>
              <span className="text-xs font-medium text-zinc-500">Objectif: &gt; 1.5 L/kg MS</span>
            </div>
          </div>

          {/* Card 2: Coût par kg de MS */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Coût Moyen du Kg de MS</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight">0.18 $</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-200">+0.01 $</span>
              <span className="text-xs font-medium text-zinc-500">Hausse liée au prix du Soya</span>
            </div>
          </div>

        </div>

        {/* Historique Placeholder */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-black text-zinc-900 mb-6">Historique des Coûts et Performances</h2>
          <div className="h-64 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl flex items-center justify-center">
            <p className="text-zinc-500 font-medium">Graphique des tendances (données à venir)</p>
          </div>
        </div>

      </div>
    </Sidenav>
  );
}
