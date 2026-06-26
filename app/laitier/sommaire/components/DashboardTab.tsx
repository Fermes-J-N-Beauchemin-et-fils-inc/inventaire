'use client';
import React from 'react';
import { faSackDollar, faCow, faCoins, faSeedling, faArrowRight, faExclamationTriangle, faCheckCircle, faChartLine } from '@fortawesome/free-solid-svg-icons';
import StatCard from './ui/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgressBar from './ui/ProgressBar';
import { SingleLineChart } from '@/app/grains/aliments/components/AlimentCharts';

interface DashboardTabProps {
  mocks: any;
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({ mocks, setActiveTab }: DashboardTabProps) {
  // Pie chart data
  const costData = [
    { name: 'En Lait (RTM)', value: 3189.82, color: '#3B82F6' },
    { name: 'Relève', value: 444.18, color: '#10B981' },
    { name: 'Taries & Autres', value: 365.76, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Alertes / Insights (Automated) */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col sm:flex-row gap-6">
        <div className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 w-6 h-6 mt-1 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 text-lg">Attention: RSA Groupe 4</h4>
            <p className="text-amber-700 mt-1">Le revenu sur alimentation du Groupe 4 (29.15$) est inférieur à la moyenne cible. Vérifiez l'ingestion de matière sèche.</p>
          </div>
        </div>
        <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 w-6 h-6 mt-1 shrink-0" />
          <div>
            <h4 className="font-bold text-green-900 text-lg">Performance Relève</h4>
            <p className="text-green-700 mt-1">Le coût d'élevage d'une taure est de 895.73$/an, ce qui est excellent (-2.1% par rapport au mois dernier).</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenu Total" 
          value={`${mocks.global.revenuTotal.toLocaleString('fr-CA')} $`} 
          subtitle="par jour"
          icon={faSackDollar} 
          colorTheme="blue"
          trend={{ value: 1.2, isPositiveGood: true }}
        />
        <StatCard 
          title="Grand Total Alim." 
          value={`${mocks.global.grandTotalAlim.toLocaleString('fr-CA')} $`} 
          subtitle="par jour"
          icon={faSeedling} 
          colorTheme="red"
          trend={{ value: -0.5, isPositiveGood: false }} // Baisse des coûts = bien, donc affiché en vert par le composant si configuré
        />
        <StatCard 
          title="RSA Moyen" 
          value={`${mocks.global.rsaMoyen.toFixed(2)} $`} 
          subtitle="/ vache / jour"
          icon={faCoins} 
          colorTheme="green"
          trend={{ value: 3.4, isPositiveGood: true }}
        />
        <StatCard 
          title="Troupeau Total" 
          value={mocks.global.totalCows.toString()} 
          subtitle="têtes"
          icon={faCow} 
          colorTheme="zinc"
          trend={{ value: 0 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Groups Summary Overview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              Historique du Coût Total (30 jours)
            </h3>
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Actuel</p>
              <p className="text-3xl font-black text-red-600">{mocks.global.grandTotalAlim.toLocaleString('fr-CA')} <span className="text-lg text-zinc-500">$</span></p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <SingleLineChart
              data={mocks.global.costHistory}
              dataKey="value"
              color="#DC2626" // red-600
              label="Coût Total"
              unit="$"
              isArea={true}
            />
          </div>
        </div>

        {/* Cost Breakdown Chart */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-zinc-900">Répartition Coûts</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString('fr-CA')} $`, 'Coût / jour']}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Groups Summary Overview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-zinc-900">Aperçu par section</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lactation Preview */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col">
              <h4 className="font-bold text-lg text-zinc-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> En Lait
              </h4>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vaches</span>
                  <span className="font-bold">{mocks.global.totalLaitCows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Moy. Kg</span>
                  <span className="font-bold">{mocks.global.moyKgLait} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Coût total</span>
                  <span className="font-bold text-red-600">3 189.82 $</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('lactation')}
                className="mt-6 w-full py-3 bg-white border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Détails <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {/* Relève Preview */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col">
              <h4 className="font-bold text-lg text-zinc-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Relève
              </h4>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vaches</span>
                  <span className="font-bold">{mocks.releveTotal.vaches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Coût / taure / an</span>
                  <span className="font-bold">{mocks.releveTotal.coutTaureAnnee} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Coût total/jr</span>
                  <span className="font-bold text-red-600">{mocks.releveTotal.coutTotalJournalier} $</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('releve')}
                className="mt-6 w-full py-3 bg-white border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Détails <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            {/* Taries Preview */}
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col">
              <h4 className="font-bold text-lg text-zinc-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Taries & Autres
              </h4>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vaches</span>
                  <span className="font-bold">{mocks.tariesTotal.vaches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Coût total/jr</span>
                  <span className="font-bold text-red-600">{mocks.tariesTotal.coutTotalJournalier} $</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('taries')}
                className="mt-auto w-full py-3 bg-white border-2 border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                Détails <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
