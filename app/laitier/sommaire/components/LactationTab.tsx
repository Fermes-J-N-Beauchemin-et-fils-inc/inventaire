'use client';
import React from 'react';
import ProgressBar from './ui/ProgressBar';

interface LactationTabProps {
  mocks: any;
}

export default function LactationTab({ mocks }: LactationTabProps) {
  const groups = mocks.lactationGroups;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top section: Global prices and reservoir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Réservoir */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xl font-bold text-zinc-500 mb-6 uppercase tracking-wider text-center">Lait Réservoir</h3>
          <div className="flex justify-center items-end gap-2 mb-8">
            <span className="text-5xl font-black text-blue-600">{mocks.global.laitReservoir.toLocaleString('fr-CA')}</span>
            <span className="text-2xl font-bold text-zinc-400 mb-1">kg</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
              <span className="block text-amber-800 font-bold text-sm mb-1">Gras</span>
              <span className="block text-2xl font-black text-amber-600">{mocks.global.composantes.gras}%</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
              <span className="block text-blue-800 font-bold text-sm mb-1">Protéine</span>
              <span className="block text-2xl font-black text-blue-600">{mocks.global.composantes.prot}%</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
              <span className="block text-purple-800 font-bold text-sm mb-1">Lac+AS</span>
              <span className="block text-2xl font-black text-purple-600">{mocks.global.composantes.lacAs}%</span>
            </div>
          </div>
        </div>

        {/* Prix */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xl font-bold text-zinc-500 mb-6 uppercase tracking-wider text-center">Prix des Composantes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="font-bold text-zinc-700">Gras</span>
              <span className="font-black text-xl text-zinc-900">{mocks.global.prixComposantes.gras.toFixed(4)} $</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="font-bold text-zinc-700">Protéine</span>
              <span className="font-black text-xl text-zinc-900">{mocks.global.prixComposantes.prot.toFixed(4)} $</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl">
              <span className="font-bold text-zinc-700">Lac+AS</span>
              <span className="font-black text-xl text-zinc-900">{mocks.global.prixComposantes.lacAs.toFixed(4)} $</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table for Groups */}
      <div className="bg-white rounded-[2rem] border-2 border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Groupe</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Vaches</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Moyenne Lait</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Coût/va/jr</th>
                <th className="p-6 font-bold text-zinc-500 uppercase tracking-wider text-sm">Coût RTM</th>
                <th className="p-6 font-bold text-blue-600 uppercase tracking-wider text-sm">RSA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {groups.map((g: any) => (
                <tr key={g.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-6 font-black text-lg text-zinc-900">{g.name}</td>
                  <td className="p-6 font-bold text-zinc-700">{g.vaches}</td>
                  <td className="p-6 font-bold text-amber-600 bg-amber-50/30">{g.lait} kg</td>
                  <td className="p-6 font-bold text-zinc-700">{g.coutVaJr.toFixed(2)} $</td>
                  <td className="p-6 font-bold text-zinc-700">{g.coutRTM.toLocaleString('fr-CA', {minimumFractionDigits:2, maximumFractionDigits:2})} $</td>
                  <td className="p-6 font-black text-blue-600 text-lg bg-blue-50/30">{g.rsa.toFixed(2)} $</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-zinc-100 border-t-2 border-zinc-300">
                <td className="p-6 font-black text-xl text-zinc-900">Total en lait</td>
                <td className="p-6 font-black text-xl text-zinc-900">{mocks.global.totalLaitCows}</td>
                <td className="p-6 font-black text-xl text-amber-600">{mocks.global.moyKgLait} kg <span className="text-sm font-bold text-zinc-500 ml-1">(moy)</span></td>
                <td className="p-6 font-black text-xl text-zinc-900">{mocks.global.costCowsMilkAvg.toFixed(2)} $ <span className="text-sm font-bold text-zinc-500 ml-1">(moy)</span></td>
                <td className="p-6 font-black text-xl text-red-600">3 189.82 $</td>
                <td className="p-6 font-black text-xl text-blue-600">32.54 $ <span className="text-sm font-bold text-zinc-500 ml-1">(moy)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Efficacité Alimentaire */}
      <div className="bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-sm">
        <h3 className="text-2xl font-black text-zinc-900 mb-6">Efficacité Alimentaire (Ratio Lait / Coût)</h3>
        <div className="space-y-6 max-w-3xl">
          {groups.map((g: any) => {
            const ratio = g.lait / g.coutVaJr;
            // scale max ratio roughly around 4.5
            return (
              <ProgressBar 
                key={g.id}
                label={g.name}
                value={ratio}
                max={4.5}
                color={ratio > 4.2 ? 'bg-green-500' : ratio > 3.7 ? 'bg-blue-500' : 'bg-amber-500'}
                formatValue={(val) => `${val.toFixed(2)} L/$`}
              />
            );
          })}
        </div>
        <p className="text-sm text-zinc-500 mt-6 font-medium">Un ratio plus élevé signifie que le groupe produit plus de lait pour chaque dollar investi en alimentation.</p>
      </div>

    </div>
  );
}
