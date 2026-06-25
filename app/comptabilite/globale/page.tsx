import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faMoneyBillWave, faFileInvoiceDollar, faChartPie, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function GlobaleComptabilitePage() {
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              Bilan Global
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              Aperçu financier global : revenus laitiers contre achats d'intrants et autres dépenses.
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
            </div>
            <select className="block w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-base font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm cursor-pointer appearance-none">
              <option>Année en cours (2026)</option>
              <option>Année précédente (2025)</option>
            </select>
          </div>
        </div>

        {/* IN vs OUT Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Entrées */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Total Entrées (IN)</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight">850 400 $</p>
            <div className="mt-6 border-t border-zinc-100 pt-4">
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-500">Ventes de lait</span>
                  <span className="text-zinc-900">790 000 $</span>
                </li>
                <li className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-500">Ventes de grains</span>
                  <span className="text-zinc-900">45 000 $</span>
                </li>
                <li className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-500">Autres revenus</span>
                  <span className="text-zinc-900">15 400 $</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sorties */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Total Sorties (OUT)</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight">320 800 $</p>
            <div className="mt-6 border-t border-zinc-100 pt-4">
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-500">Achats de grains/suppléments</span>
                  <span className="text-zinc-900">280 000 $</span>
                </li>
                <li className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-500">Autres dépenses (Vétérinaire, etc.)</span>
                  <span className="text-zinc-900">40 800 $</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Top Expenses */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-zinc-100 flex items-center justify-center shrink-0">
             <FontAwesomeIcon icon={faChartPie} className="text-zinc-300 text-4xl" />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-black text-zinc-900 mb-4">Répartition des dépenses alimentaires</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-semibold text-zinc-600">Tourteau de Soya 48%</div>
                <div className="flex-1 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-500 w-[60%] h-full rounded-full"></div>
                </div>
                <div className="w-12 text-right font-bold text-zinc-900 text-sm">60%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-semibold text-zinc-600">Maïs Grain</div>
                <div className="flex-1 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-400 w-[25%] h-full rounded-full"></div>
                </div>
                <div className="w-12 text-right font-bold text-zinc-900 text-sm">25%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-semibold text-zinc-600">Minéraux</div>
                <div className="flex-1 bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-300 w-[15%] h-full rounded-full"></div>
                </div>
                <div className="w-12 text-right font-bold text-zinc-900 text-sm">15%</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Sidenav>
  );
}
