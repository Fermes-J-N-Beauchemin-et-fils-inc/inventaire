'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faFileContract, faBuilding, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { createClient, createSaleContract, createSale, toggleClientStatus, toggleSaleContractStatus, deleteSaleSubContract } from '../actions';
import toast from 'react-hot-toast';

export type ClientWithDetails = {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  url: string | null;
  is_active: boolean;
  contracts: any[];
  sales: any[];
};

interface Props {
  initialClients: ClientWithDetails[];
  aliments: { id: number; name: string; unit_type: { name: string } }[];
}

export default function VentesClient({ initialClients, aliments }: Props) {
  const [activeTab, setActiveTab] = useState<'clients' | 'contrats' | 'ventes'>('clients');
  const [showModal, setShowModal] = useState<'supplier' | 'edit-supplier' | 'contract' | 'edit-subcontract' | 'new-subcontract' | 'sale' | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<ClientWithDetails | null>(null);
  const [editingSubContract, setEditingSubContract] = useState<any | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = React.useTransition();

  // Derive flat lists for easier rendering
  const allContracts = initialClients.flatMap(s => s.contracts.map((c: any) => ({
    ...c,
    supplier_name: s.name,
    total_kg_left: c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0
  })));

  const allSales = initialClients.flatMap(s => s.sales.map((d: any) => {
    const contractNames = d.sale_subcontracts?.map((dsc: any) => dsc.sub_contract.name).join(', ') || 'Spot / Non alloué';
    return {
      ...d,
      contract_name: contractNames,
      supplier_name: s.name,
      food_name: d.food.name,
      unit: 'kg' // Since we receive in kg for complex sales
    };
  }));

  const handleToggleSupplier = (id: number, status: boolean) => {
    startTransition(async () => {
      try {
        await toggleClientStatus(id, !status);
        toast.success(`Client ${status ? 'désactivé' : 'activé'} avec succès.`);
      } catch (e) {
        toast.error("Erreur lors de la modification.");
      }
    });
  };

  const handleToggleContract = (id: number, status: boolean) => {
    startTransition(async () => {
      try {
        await toggleSaleContractStatus(id, !status);
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

  const handleDeleteSubContract = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-zinc-800">Êtes-vous sûr de vouloir supprimer ce sous-contrat ? Cette action est irréversible.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-colors" 
            onClick={() => toast.dismiss(t.id)}
          >
            Annuler
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20" 
            onClick={() => {
              toast.dismiss(t.id);
              startTransition(async () => {
                try {
                  await deleteSaleSubContract(id);
                  toast.success("Sous-contrat supprimé.");
                } catch(e: any) {
                  toast.error(e.message || "Erreur lors de la suppression.");
                }
              });
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    ), { duration: Infinity });
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
            Gérez vos clients, négociez vos contrats et suivez vos ventes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-zinc-100 p-2 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('clients')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'clients' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faBuilding} className="mr-2" /> Clients
        </button>
        <button 
          onClick={() => setActiveTab('contrats')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'contrats' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Contrats
        </button>
        <button 
          onClick={() => setActiveTab('ventes')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'ventes' ? 'bg-white shadow-sm text-indigo-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faTruck} className="mr-2" /> Ventes
        </button>
      </div>

      {/* Actions */}
      <div className="mb-8 flex justify-end">
        {activeTab === 'clients' && (
          <button onClick={() => setShowModal('supplier')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Ajouter un Client
          </button>
        )}
        {activeTab === 'contrats' && (
          <button onClick={() => setShowModal('contract')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Nouveau Contrat
          </button>
        )}

      </div>

      {/* Content - Clients */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialClients.map(f => (
            <div key={f.id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col transition-all ${f.is_active ? 'bg-white border-zinc-200' : 'bg-zinc-100 border-zinc-200 opacity-60 grayscale'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {f.url && (
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${f.url}&sz=128`} 
                      alt="" 
                      className="w-8 h-8 rounded-md bg-zinc-100" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <h3 className="text-2xl font-black text-zinc-900">{f.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingSupplier(f); setShowModal('edit-supplier'); }}
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
          {initialClients.length === 0 && <p className="text-zinc-500">Aucun client trouvé.</p>}
        </div>
      )}

      {/* Content - Contrats */}
      {activeTab === 'contrats' && (
        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-sm uppercase tracking-widest border-b border-zinc-200">
                <th className="p-6 font-black">Contrat</th>
                <th className="p-6 font-black">Client</th>
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
                              <div key={sc.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-1 relative group">
                                <div className="flex justify-between items-start pr-12">
                                  <span className="font-black text-zinc-800">{sc.name}</span>
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setEditingSubContract(sc); setShowModal('edit-subcontract'); }}
                                      className="text-zinc-400 hover:text-indigo-600 transition-colors"
                                      title="Modifier"
                                    >
                                      ✎
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSubContract(sc.id); }}
                                      className="text-zinc-400 hover:text-red-600 transition-colors"
                                      title="Supprimer"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
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
                            <p className="text-sm text-zinc-500 col-span-full">Aucun sous-contrat.</p>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedContractId(c.id); setShowModal('new-subcontract'); }}
                            className="bg-white border-2 border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-indigo-600 transition-all cursor-pointer h-full min-h-[100px]"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xl" />
                            <span className="font-bold text-sm">Ajouter</span>
                          </button>
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

      {/* Content - Ventes */}
      {activeTab === 'ventes' && (
        <div className="space-y-4">
          {allSales.map(d => {
            const isDelivered = d.date_sold && new Date(d.date_sold) <= new Date();
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
                  <p className="text-2xl font-black text-zinc-900">{d.quantity_sold} <span className="text-sm text-zinc-500">{d.unit}</span></p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${isDelivered ? 'bg-zinc-100 text-zinc-500' : 'bg-green-100 text-green-700'}`}>
                      {isDelivered ? 'Livrè' : 'En Attente'}
                    </span>
                    {!isDelivered && (
                      <button
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-3">
                              <p className="font-bold text-zinc-800">Voulez-vous vraiment supprimer cette vente planifiée ?</p>
                              <div className="flex justify-end gap-2 mt-2">
                                <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold" onClick={() => toast.dismiss(t.id)}>Annuler</button>
                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold" onClick={async () => {
                                  toast.dismiss(t.id);
                                  const { deleteSale } = await import('../actions');
                                  try {
                                    await deleteSale(d.id);
                                    toast.success("Vente planifiée supprimée.");
                                  } catch (error: any) {
                                    toast.error(error.message || "Erreur lors de la suppression.");
                                  }
                                }}>Supprimer</button>
                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold" onClick={async () => {
                                  toast.dismiss(t.id);
                                  const { validateSale } = await import('../actions');
                                  try {
                                    await validateSale(d.id);
                                    toast.success("Vente validée !");
                                  } catch (error: any) {
                                    toast.error(error.message || "Erreur lors de la validation. Vérifiez le stock disponible.");
                                  }
                                }}>Valider</button>
                              </div>
                            </div>
                          ), { duration: Infinity });
                        }}
                        className="w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-black transition-all"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {allSales.length === 0 && <p className="text-zinc-500">Aucune vente trouvée.</p>}
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
                {showModal === 'supplier' ? 'Nouveau Client' : 
                 showModal === 'edit-supplier' ? 'Modifier Client' :
                 showModal === 'contract' ? 'Nouveau Contrat' : 
                 showModal === 'edit-subcontract' ? 'Modifier Sous-contrat' :
                 'Planifier Vente'}
              </h2>

              {/* Form: Supplier */}
              {showModal === 'supplier' && (
                <form action={createClient} onSubmit={() => setTimeout(() => setShowModal(null), 500)} className="space-y-8">
                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
                    <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Informations Principales</h2>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Nom *</label>
                      <input name="name" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Synagri..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Téléphone *</label>
                        <input name="phone_number" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: 450-123-4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Email *</label>
                        <input name="email" type="email" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: contact@synagri.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Adresse *</label>
                      <input name="address" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: 123 Route Agricole..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">URL du site web (Optionnel)</label>
                      <input name="url" type="text" placeholder="Ex: synagri.com" className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      <p className="text-xs font-bold text-zinc-400 mt-2 ml-1">Sert à afficher le logo automatiquement.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-indigo-800 active:border-b-0 flex items-center justify-center gap-3 w-full sm:w-auto">
                      Ajouter le client
                    </button>
                  </div>
                </form>
              )}

              {/* Form: Edit Supplier */}
              {showModal === 'edit-supplier' && editingSupplier && (
                <form action={async (fd) => { await import('../actions').then(m => m.updateClient(fd)); setShowModal(null); }} className="space-y-8">
                  <input type="hidden" name="id" value={editingSupplier.id} />
                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
                    <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Informations Principales</h2>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Nom *</label>
                      <input name="name" defaultValue={editingSupplier.name} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Téléphone *</label>
                        <input name="phone_number" defaultValue={editingSupplier.phone_number} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Email *</label>
                        <input name="email" type="email" defaultValue={editingSupplier.email} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Adresse *</label>
                      <input name="address" defaultValue={editingSupplier.address} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">URL du site web (Optionnel)</label>
                      <input name="url" type="text" defaultValue={editingSupplier.url || ''} placeholder="Ex: synagri.com" className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      <p className="text-xs font-bold text-zinc-400 mt-2 ml-1">Sert à afficher le logo automatiquement.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-indigo-800 active:border-b-0 flex items-center justify-center gap-3 w-full sm:w-auto">
                      Sauvegarder les modifications
                    </button>
                  </div>
                </form>
              )}

              {/* Form: Contract */}
              {showModal === 'contract' && (
                <form action={createSaleContract} onSubmit={() => setTimeout(() => setShowModal(null), 500)} className="space-y-8">
                  <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 space-y-6">
                    <h2 className="text-xl font-black text-emerald-800 uppercase tracking-widest mb-4">Détails du Contrat</h2>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Référence du Contrat *</label>
                      <input name="name" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" placeholder="Ex: Maïs 2026..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Client *</label>
                        <select name="supplier_id" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none">
                          <option value="">Sélectionner</option>
                          {initialClients.filter(f => f.is_active).map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Aliment *</label>
                        <select name="food_id" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none">
                          <option value="">Choisir...</option>
                          {aliments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.unit_type.name})</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Quantité Totale (kg) *</label>
                        <input name="total_kg" type="number" step="0.01" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Prix par kg ($) *</label>
                        <input name="price_per_kg" type="number" step="0.01" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-5 rounded-[1.5rem] border-2 border-zinc-200 shadow-sm">
                      <input type="checkbox" id="is_spot" name="is_spot" value="true" className="w-6 h-6 accent-emerald-600 rounded-md" />
                      <label htmlFor="is_spot" className="font-black text-emerald-900 cursor-pointer">Ceci est un Contrat Spot (Une seule vente)</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Date de début *</label>
                        <input name="date_start" type="date" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Date de fin (Laisser vide si Spot)</label>
                        <input name="date_end" type="date" className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-emerald-800 active:border-b-0 flex items-center justify-center gap-3 w-full sm:w-auto">
                      Créer le contrat
                    </button>
                  </div>
                </form>
              )}

              {/* Form: Edit Sub-Contract */}
              {showModal === 'edit-subcontract' && editingSubContract && (
                <form action={async (fd) => { await import('../actions').then(m => m.updateSaleSubContract(fd)); setShowModal(null); }} className="space-y-8">
                  <input type="hidden" name="id" value={editingSubContract.id} />
                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
                    <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Valeurs du Sous-contrat</h2>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Nom du sous-contrat *</label>
                      <input name="name" defaultValue={editingSubContract.name} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Quantité Attendue (kg) *</label>
                        <input name="expected_kg" type="number" step="0.01" defaultValue={editingSubContract.expected_kg} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Reste à Livrer (kg) *</label>
                        <input name="kg_left_to_deliver" type="number" step="0.01" defaultValue={editingSubContract.kg_left_to_deliver} required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-blue-800 active:border-b-0 flex items-center justify-center gap-3 w-full sm:w-auto">
                      Sauvegarder les modifications
                    </button>
                  </div>
                </form>
              )}

              {/* Form: New Sub-Contract */}
              {showModal === 'new-subcontract' && selectedContractId && (
                <form action={async (fd) => { await import('../actions').then(m => m.createSaleSubContract(fd)); setShowModal(null); }} className="space-y-8">
                  <input type="hidden" name="contract_id" value={selectedContractId} />
                  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6">
                    <h2 className="text-xl font-black text-zinc-800 uppercase tracking-widest mb-4">Nouveau Sous-contrat</h2>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Nom du sous-contrat *</label>
                      <input name="name" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Novembre 2026" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Quantité Attendue (kg) *</label>
                        <input name="expected_kg" type="number" step="0.01" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2">Reste à Livrer (kg) *</label>
                        <input name="kg_left_to_deliver" type="number" step="0.01" required className="w-full px-5 py-4 bg-white border-2 border-zinc-200 rounded-[1.5rem] text-lg font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" placeholder="0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-indigo-600/30 hover:-translate-y-1 active:translate-y-0 transition-all border-b-4 border-indigo-800 active:border-b-0 flex items-center justify-center gap-3 w-full sm:w-auto">
                      Ajouter le sous-contrat
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
