'use client';

import React, { useState } from 'react';
import { SupplierWithDetails } from '../data/fetchFournisseurs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faFileContract, faBuilding, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { createSupplier, createContract, createDelivery, toggleSupplierStatus, toggleContractStatus } from '../actions';
import toast from 'react-hot-toast';

interface Props {
  initialFournisseurs: SupplierWithDetails[];
  aliments: { id: number; name: string; unit_type: { name: string } }[];
}

export default function FournisseursClient({ initialFournisseurs, aliments }: Props) {
  const [activeTab, setActiveTab] = useState<'fournisseurs' | 'contrats' | 'livraisons'>('fournisseurs');
  const [showModal, setShowModal] = useState<'supplier' | 'contract' | 'delivery' | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = React.useTransition();

  // Derive flat lists for easier rendering
  const allContracts = initialFournisseurs.flatMap(s => s.contracts.map(c => ({
    ...c,
    supplier_name: s.name,
    total_kg_left: c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0
  })));

  const allDeliveries = initialFournisseurs.flatMap(s => s.deliveries.map(d => {
    const contractNames = d.delivery_subcontracts?.map((dsc: any) => dsc.sub_contract.name).join(', ') || 'Spot / Non alloué';
    return {
      ...d,
      contract_name: contractNames,
      supplier_name: s.name,
      food_name: d.food.name,
      unit: 'kg' // Since we receive in kg for complex deliveries
    };
  }));

  const handleToggleSupplier = (id: number, status: boolean) => {
    startTransition(async () => {
      try {
        await toggleSupplierStatus(id, !status);
        toast.success(`Fournisseur ${status ? 'désactivé' : 'activé'} avec succès.`);
      } catch (e) {
        toast.error("Erreur lors de la modification.");
      }
    });
  };

  const handleToggleContract = (id: number, status: boolean) => {
    startTransition(async () => {
      try {
        await toggleContractStatus(id, !status);
        toast.success(`Contrat ${status ? 'désactivé' : 'activé'} avec succès.`);
      } catch (e) {
        toast.error("Erreur lors de la modification.");
      }
    });
  };

  const toggleContractExpand = (id: number) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <FontAwesomeIcon icon={faTruck} />
            </div>
            Chaîne d'Approvisionnement
          </h1>
          <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
            Gérez vos fournisseurs, négociez vos contrats et suivez vos livraisons.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-zinc-100 p-2 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('fournisseurs')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'fournisseurs' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faBuilding} className="mr-2" /> Fournisseurs
        </button>
        <button 
          onClick={() => setActiveTab('contrats')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'contrats' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Contrats
        </button>
        <button 
          onClick={() => setActiveTab('livraisons')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'livraisons' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faTruck} className="mr-2" /> Livraisons
        </button>
      </div>

      {/* Actions */}
      <div className="mb-8 flex justify-end">
        {activeTab === 'fournisseurs' && (
          <button onClick={() => setShowModal('supplier')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Ajouter un Fournisseur
          </button>
        )}
        {activeTab === 'contrats' && (
          <button onClick={() => setShowModal('contract')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Nouveau Contrat
          </button>
        )}

      </div>

      {/* Content - Fournisseurs */}
      {activeTab === 'fournisseurs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialFournisseurs.map(f => (
            <div key={f.id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col transition-all ${f.is_active ? 'bg-white border-zinc-200' : 'bg-zinc-100 border-zinc-200 opacity-60 grayscale'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {f.url && (
                    <img src={`https://www.google.com/s2/favicons?domain=${f.url}&sz=128`} alt="" className="w-8 h-8 rounded-md bg-zinc-100" />
                  )}
                  <h3 className="text-2xl font-black text-zinc-900">{f.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { /* TODO handle edit modal */ }}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleToggleSupplier(f.id, f.is_active)}
                    disabled={isPending}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${f.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                  >
                    {f.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
              <div className="text-zinc-500 space-y-1 mb-6">
                <p>📞 {f.phone_number}</p>
                <p>✉️ {f.email}</p>
                <p>📍 {f.address}</p>
                {f.url && <p>🔗 <a href={f.url.startsWith('http') ? f.url : `https://${f.url}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{f.url}</a></p>}
              </div>
              <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center text-sm font-bold text-zinc-400">
                <span>{f.contracts.length} contrats</span>
                <span className={f.is_active ? "text-green-500" : "text-red-500"}>
                  {f.is_active ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          ))}
          {initialFournisseurs.length === 0 && <p className="text-zinc-500">Aucun fournisseur trouvé.</p>}
        </div>
      )}

      {/* Content - Contrats */}
      {activeTab === 'contrats' && (
        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-sm uppercase tracking-widest border-b border-zinc-200">
                <th className="p-6 font-black">Contrat</th>
                <th className="p-6 font-black">Fournisseur</th>
                <th className="p-6 font-black">Aliment</th>
                <th className="p-6 font-black">Quantité (kg)</th>
                <th className="p-6 font-black">Prix/kg</th>
                <th className="p-6 font-black">Échéance</th>
                <th className="p-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allContracts.map(c => (
                <React.Fragment key={c.id}>
                  <tr 
                    className={`transition-colors cursor-pointer ${c.is_active ? 'hover:bg-zinc-50' : 'bg-zinc-50 opacity-60 grayscale'} ${expandedContracts.has(c.id) ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => toggleContractExpand(c.id)}
                  >
                    <td className="p-6 font-bold text-zinc-900 flex items-center gap-3">
                      <span className={`transform transition-transform ${expandedContracts.has(c.id) ? 'rotate-90' : ''}`}>▶</span>
                      {c.name}
                      {!c.is_active && <span className="ml-2 text-xs font-black text-red-500 uppercase">Désactivé</span>}
                    </td>
                    <td className="p-6 font-bold text-zinc-600">{c.supplier_name}</td>
                    <td className="p-6 font-bold text-indigo-600">
                      <span className="bg-indigo-50/50 px-3 py-1 rounded-lg">{c.food.name}</span>
                    </td>
                    <td className="p-6">
                      <span className="font-black text-zinc-900">{c.total_kg_left}</span>
                      <span className="text-zinc-400 text-sm"> / {c.total_kg}</span>
                    </td>
                    <td className="p-6 font-bold text-emerald-600">{c.price_per_kg}$</td>
                    <td className="p-6 text-zinc-500 font-medium">
                      {c.date_end ? new Date(c.date_end).toLocaleDateString('fr-CA') : 'Spot'}
                    </td>
                    <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleToggleContract(c.id, c.is_active)}
                        disabled={isPending}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${c.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}
                      >
                        {c.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                  {expandedContracts.has(c.id) && (
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <td colSpan={7} className="p-6">
                        <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {c.sub_contracts && c.sub_contracts.length > 0 ? (
                            c.sub_contracts.map((sc: any) => (
                              <div key={sc.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-1">
                                <span className="font-black text-zinc-800">{sc.name}</span>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-zinc-500">Reste:</span>
                                  <span className={`font-bold ${sc.kg_left_to_deliver > 0 ? 'text-indigo-600' : 'text-green-600'}`}>
                                    {sc.kg_left_to_deliver} kg
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-indigo-500 h-2 rounded-full" 
                                    style={{ width: `${Math.max(0, 100 - (sc.kg_left_to_deliver / sc.expected_kg) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-zinc-500">Aucun sous-contrat.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {allContracts.length === 0 && <p className="p-6 text-zinc-500 text-center">Aucun contrat trouvé.</p>}
        </div>
      )}

      {/* Content - Livraisons */}
      {activeTab === 'livraisons' && (
        <div className="space-y-4">
          {allDeliveries.map(d => {
            const isDelivered = d.date_delivered && new Date(d.date_delivered) <= new Date();
            return (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 ${isDelivered ? 'bg-zinc-100 text-zinc-400' : 'bg-orange-100 text-orange-700'}`}>
                    <span className="text-xs font-black uppercase">{new Date(d.date_expected).toLocaleDateString('fr-CA', { month: 'short' })}</span>
                    <span className="text-2xl font-black leading-none">{new Date(d.date_expected).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-zinc-900">{d.food_name}</h4>
                    <p className="text-zinc-500 font-bold">{d.supplier_name} <span className="text-zinc-300 mx-2">|</span> Contrat: {d.contract_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-zinc-900">{d.quantity_received} <span className="text-sm text-zinc-500">{d.unit}</span></p>
                  <span className={`inline-block px-3 py-1 mt-1 rounded-lg text-xs font-black uppercase tracking-wider ${isDelivered ? 'bg-zinc-100 text-zinc-500' : 'bg-green-100 text-green-700'}`}>
                    {isDelivered ? 'Livrè' : 'En Attente'}
                  </span>
                </div>
              </div>
            );
          })}
          {allDeliveries.length === 0 && <p className="text-zinc-500">Aucune livraison trouvée.</p>}
        </div>
      )}

      {/* Modals for Forms */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden relative my-auto">
            <button 
              onClick={() => setShowModal(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl font-black text-zinc-900 mb-8">
                {showModal === 'supplier' ? 'Nouveau Fournisseur' : showModal === 'contract' ? 'Nouveau Contrat' : 'Planifier Livraison'}
              </h2>

              {/* Form: Supplier */}
              {showModal === 'supplier' && (
                <form action={createSupplier} onSubmit={() => setTimeout(() => setShowModal(null), 500)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Nom *</label>
                    <input name="name" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Téléphone *</label>
                      <input name="phone_number" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Email *</label>
                      <input name="email" type="email" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Adresse *</label>
                    <input name="address" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">URL du site web (Optionnel)</label>
                    <input name="url" type="text" placeholder="ex: synagri.com" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    <p className="text-xs text-zinc-400 mt-1">Sert à afficher le logo automatiquement.</p>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black p-4 rounded-xl hover:bg-indigo-700 mt-4">Enregistrer</button>
                </form>
              )}

              {/* Form: Contract */}
              {showModal === 'contract' && (
                <form action={createContract} onSubmit={() => setTimeout(() => setShowModal(null), 500)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Référence du Contrat *</label>
                    <input name="name" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Fournisseur *</label>
                      <select name="supplier_id" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold">
                        <option value="">Sélectionner</option>
                        {initialFournisseurs.filter(f => f.is_active).map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Aliment *</label>
                      <select name="food_id" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl appearance-none">
                        <option value="">Choisir...</option>
                        {aliments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.unit_type.name})</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Quantité Totale (kg) *</label>
                      <input name="total_kg" type="number" step="0.01" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Prix par kg ($) *</label>
                      <input name="price_per_kg" type="number" step="0.01" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <input type="checkbox" id="is_spot" name="is_spot" value="true" className="w-5 h-5 accent-indigo-600" />
                    <label htmlFor="is_spot" className="font-bold text-indigo-900 cursor-pointer">Ceci est un Contrat Spot (Une seule livraison)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Date de début *</label>
                      <input name="date_start" type="date" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Date de fin (Laisser vide si Spot)</label>
                      <input name="date_end" type="date" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-black p-4 rounded-xl hover:bg-emerald-700 mt-4">Enregistrer</button>
                </form>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
}
