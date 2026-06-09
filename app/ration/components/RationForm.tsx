import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarrot, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { GroupsState, GroupKey } from '../types';
import { mockAlimentsDetails } from '../../aliments/data/mockAliments';

interface RationFormProps {
  groups: GroupsState;
  notes: string;
  setNotes: (v: string) => void;
  handleGroupChange: (groupKey: GroupKey, field: 'indice' | 'fed' | 'real', value: string | number) => void;
  handleAddAliment: (groupKey: GroupKey) => void;
  handleUpdateAliment: (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2', value: string) => void;
  handleRemoveAliment: (groupKey: GroupKey, id: string) => void;
  onGenerate: () => void;
}

export default function RationForm({ 
  groups, notes, setNotes, handleGroupChange, 
  handleAddAliment, handleUpdateAliment, handleRemoveAliment, 
  onGenerate 
}: RationFormProps) {
  
  const renderDifference = (fed: number, real: number) => {
    const diff = fed - real;
    if (diff === 0) return <span className="font-bold text-zinc-500">Exact</span>;
    if (diff > 0) return <span className="font-bold text-[#15803D]">+{diff} (Surplus)</span>;
    return <span className="font-bold text-red-600">{diff} (Manque)</span>;
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-zinc-200">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FontAwesomeIcon icon={faCarrot} />
              </div>
              Configuration de la ration
            </h1>
            <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
              Type de ration : <span className="text-blue-600 font-bold underline">Normal</span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Groups Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(Object.keys(groups) as GroupKey[]).map((key) => (
              <div key={key} className="bg-zinc-50 p-6 rounded-xl border-2 border-zinc-300 shadow-sm relative flex flex-col">
                <h3 className="text-xl font-black text-black mb-4 border-b-2 border-zinc-200 pb-2">{groups[key].name}</h3>
                
                {/* Global Settings */}
                <div className="space-y-4 mb-6">
                  {/* Indice */}
                  <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                    <span className="text-sm font-bold text-black">Indice :</span>
                    <input
                      type="number" step="0.01"
                      value={groups[key].indice}
                      onChange={(e) => handleGroupChange(key, 'indice', e.target.value)}
                      className="w-24 px-3 py-1 border-2 border-yellow-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-yellow-500 bg-white text-center"
                    />
                  </div>

                  <div className="flex justify-between items-center text-black font-semibold">
                    <span>Nombre de vaches réel :</span>
                    <input
                      type="number"
                      value={groups[key].real}
                      onChange={(e) => handleGroupChange(key, 'real', e.target.value)}
                      className="w-24 px-3 py-1 border-2 border-zinc-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-blue-500 bg-white text-center"
                    />
                  </div>

                  <div className="flex justify-between items-center text-black font-semibold">
                    <span>Nombre de vaches nourries :</span>
                    <input
                      type="number"
                      value={groups[key].fed}
                      onChange={(e) => handleGroupChange(key, 'fed', e.target.value)}
                      className="w-24 px-3 py-1 border-2 border-zinc-400 rounded-md font-black text-lg text-black focus:ring-2 focus:ring-blue-500 bg-white text-center"
                    />
                  </div>

                  <div className="pt-3 border-t-2 border-zinc-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-black mr-2">Différence :</span>
                    {renderDifference(groups[key].fed, groups[key].real)}
                  </div>
                </div>

                {/* Aliments Editor */}
                <div className="flex-1 border-t-2 border-zinc-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-zinc-800">Ingrédients (Choix multiple)</h4>
                    <button 
                      onClick={() => handleAddAliment(key)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {groups[key].aliments.map(aliment => (
                      <div key={aliment.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-zinc-200 shadow-sm hover:border-blue-300 transition-colors">
                        <select 
                          value={aliment.name} 
                          onChange={(e) => handleUpdateAliment(key, aliment.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 text-base font-black text-black border-2 border-zinc-400 hover:border-black focus:border-blue-600 rounded-lg focus:outline-none bg-zinc-100 shadow-sm cursor-pointer"
                        >
                          {/* Combine mock aliments + original hardcoded names if not in mock */}
                          {Array.from(new Set([
                            ...mockAlimentsDetails.map(a => a.commonName),
                            aliment.name // ensure current value is selectable
                          ])).sort().map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleRemoveAliment(key, aliment.id)}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
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
          {/* Action */}
          <div className="pt-6 border-t-2 border-zinc-200">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                onGenerate();
              }}
              className="w-full py-5 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-2xl rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Générer la recette &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
