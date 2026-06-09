import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarrot, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { GroupKey, GroupsState } from '../types';

interface RationFormProps {
  groups: GroupsState;
  handleGroupChange: (key: GroupKey, field: 'fed' | 'indice', value: string) => void;
  handleAddAliment: (groupKey: GroupKey) => void;
  handleRemoveAliment: (groupKey: GroupKey, id: string) => void;
  handleUpdateAliment: (groupKey: GroupKey, id: string, field: 'name' | 'v1' | 'v2', value: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onGenerateReport: () => void;
}

export default function RationForm({
  groups,
  handleGroupChange,
  handleAddAliment,
  handleRemoveAliment,
  handleUpdateAliment,
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
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-300">
        
        {/* Header Section */}
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

                {/* Aliments Editor */}
                <div className="flex-1 border-t-2 border-zinc-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-zinc-800">Ingrédients (Maquette)</h4>
                    <button 
                      onClick={() => handleAddAliment(key)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 px-2 text-xs font-bold text-zinc-500">
                      <span>Nom de l'aliment</span>
                      <span className="text-center">Aliment</span>
                      <span className="text-center">RTM</span>
                      <span className="w-8"></span>
                    </div>
                    {groups[key].aliments.map(aliment => (
                      <div key={aliment.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center bg-white p-2 rounded-lg border border-zinc-200 shadow-sm hover:border-blue-300 transition-colors">
                        <input 
                          type="text" 
                          value={aliment.name} 
                          onChange={(e) => handleUpdateAliment(key, aliment.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm font-semibold border border-transparent hover:border-zinc-300 focus:border-blue-500 rounded focus:outline-none"
                          placeholder="Nom"
                        />
                        <input 
                          type="text" 
                          value={aliment.v1} 
                          onChange={(e) => handleUpdateAliment(key, aliment.id, 'v1', e.target.value)}
                          className="w-full px-2 py-1 text-sm text-center font-bold text-blue-700 border border-transparent hover:border-zinc-300 focus:border-blue-500 rounded focus:outline-none"
                          placeholder="v1"
                        />
                        <input 
                          type="text" 
                          value={aliment.v2} 
                          onChange={(e) => handleUpdateAliment(key, aliment.id, 'v2', e.target.value)}
                          className="w-full px-2 py-1 text-sm text-center font-bold text-zinc-700 border border-transparent hover:border-zinc-300 focus:border-blue-500 rounded focus:outline-none"
                          placeholder="v2"
                        />
                        <button 
                          onClick={() => handleRemoveAliment(key, aliment.id)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
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
