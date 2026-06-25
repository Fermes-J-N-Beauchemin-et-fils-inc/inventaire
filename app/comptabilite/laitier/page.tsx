import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faChartLine, faCoins, faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default function LaitierComptabilitePage() {
  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 font-sans pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                <FontAwesomeIcon icon={faDroplet} />
              </div>
              Performances Laitières
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              Analysez la rentabilité de votre production laitière et votre marge sur coût alimentaire.
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
            </div>
            <select className="block w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-base font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm cursor-pointer appearance-none">
              <option>Juin 2026</option>
              <option>Mai 2026</option>
              <option>Avril 2026</option>
            </select>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Revenus du Lait */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCoins} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Revenus du lait (Est.)</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">124 500 $</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200">+5.2%</span>
              <span className="text-xs font-medium text-zinc-400">vs mois précédent</span>
            </div>
          </div>

          {/* Card 2: Coût Alimentation Total */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Coût Alimentation</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">42 800 $</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-200">+1.4%</span>
              <span className="text-xs font-medium text-zinc-400">vs mois précédent</span>
            </div>
          </div>

          {/* Card 3: Marge sur Coût Alimentaire */}
          <div className="bg-blue-600 p-6 rounded-2xl border border-blue-700 shadow-md text-white">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">Marge sur coût alimentaire</h3>
            </div>
            <p className="text-4xl font-black tracking-tight mb-1">81 700 $</p>
            <p className="text-sm font-medium text-blue-200">65.6% des revenus</p>
          </div>

        </div>

        {/* Coût par Litre Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-zinc-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-zinc-900">Coût par litre de lait</h2>
              <p className="text-zinc-500 font-medium text-sm mt-1">Part de l'alimentation dans le coût de production global</p>
            </div>
            <div className="px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Volume Produit (Est.)</p>
                <p className="text-lg font-black text-zinc-900">142 000 L</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl flex-1 w-full">
              <div className="flex items-end gap-2 mb-1">
                <p className="text-5xl font-black text-zinc-900">0.30 $</p>
                <p className="text-xl text-zinc-500 font-bold mb-1">/ Litre</p>
              </div>
              <p className="text-sm font-medium text-zinc-500 mt-2">Soit <strong className="text-zinc-700">30.14 $</strong> par hectolitre (hl)</p>
            </div>
            <div className="flex-1 w-full text-zinc-600 text-sm leading-relaxed">
              <p>Ce coût ne comprend que l'alimentation distribuée aux animaux via les rations (incluant concentrés, ensilages et foin). Les autres dépenses (frais vétérinaires, main d'œuvre, amortissements) ne sont pas comptabilisées dans cette section.</p>
            </div>
          </div>
        </div>

      </div>
    </Sidenav>
  );
}
