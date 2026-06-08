import React from 'react';
import Image from "next/image";
import logo from '../../../public/images/logo.png';
import { GroupKey, GroupsState } from '../types';

interface RationFormProps {
  groups: GroupsState;
  handleGroupChange: (key: GroupKey, field: 'fed' | 'indice', value: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onGenerateReport: () => void;
}

export default function RationForm({
  groups,
  handleGroupChange,
  notes,
  setNotes,
  onGenerateReport
}: RationFormProps) {

  const renderDifference = (fed: number, real: number) => {
    const diff = fed - real;
    if (diff > 0) return <span className="text-blue-700 font-bold text-sm">+{diff} (surplus)</span>;
    if (diff < 0) return <span className="text-red-700 font-bold text-sm">{diff} (manque)</span>;
    return <span className="text-green-700 font-bold text-sm">Égal</span>;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 text-black">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-300">
        <div className="flex items-center justify-center mb-8 h-24 relative w-full max-w-[200px] mx-auto">
          <Image src={logo} alt="Logo" fill className="object-contain" priority />
        </div>

        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-center text-black">Configuration de la ration</h1>
          <div className="text-xl sm:text-3xl font-black text-black underline">Normal</div>
        </div>

        <div className="space-y-8">
          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(groups) as GroupKey[]).map((key) => (
              <div key={key} className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300 shadow-sm relative">
                <h3 className="text-xl font-black text-black mb-4 border-b-2 border-zinc-200 pb-2">{groups[key].name}</h3>
                <div className="space-y-5">
                  {/* Indice */}
                  <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                    <label className="text-sm font-bold text-black">Indice :</label>
                    <input
                      type="number" step="0.01"
                      value={groups[key].indice}
                      onChange={(e) => handleGroupChange(key, 'indice', e.target.value)}
                      className="w-24 px-3 py-1 border-2 border-yellow-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-yellow-500 bg-white text-center"
                    />
                  </div>

                  <div className="flex justify-between items-center text-black font-semibold">
                    <span>Nombre de vaches réel :</span>
                    <span className="font-black text-xl">{groups[key].real}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Nombre de vaches nourries :</label>
                    <input
                      type="number"
                      value={groups[key].fed}
                      onChange={(e) => handleGroupChange(key, 'fed', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-zinc-400 rounded-lg font-black text-lg text-black focus:ring-4 focus:ring-[#15803D] focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t-2 border-zinc-200 flex items-center">
                    <span className="text-sm font-bold text-black mr-2">Différence :</span>
                    {renderDifference(groups[key].fed, groups[key].real)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300 shadow-sm">
            <label className="block text-xl font-black text-black mb-3">Notes (apparaîtront à la fin du rapport)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Exemple: Surveiller le groupe 3..."
              className="w-full px-4 py-3 border-2 border-zinc-400 rounded-lg text-lg font-medium text-black focus:ring-4 focus:ring-blue-500 bg-white resize-y"
              rows={4}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              onGenerateReport();
            }}
            className="w-full py-5 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-2xl rounded-xl shadow-md transition-all cursor-pointer"
          >
            Générer la recette
          </button>
        </div>
      </div>
    </div>
  );
}
