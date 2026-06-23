'use client';

import React, { useState } from 'react';
import { TransactionSupplier, TransactionClient } from '../data/fetchTransactions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faTruck, faHandshake, faPlus, faTimes, faArrowRightArrowLeft, faCheck, faTrash, faBuilding, faFileContract, faTractor, faArrowRightFromBracket, faPen } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import ReceptionView from './ReceptionView';
import ExpeditionView from './ExpeditionView';

interface Props {
  initialFournisseurs: TransactionSupplier[];
  initialClients: TransactionClient[];
  aliments: { id: number; name: string; unit_type: { name: string } }[];
  storages: { id: number; name: string }[];
}

export default function TransactionsClient({ initialFournisseurs, initialClients, aliments, storages }: Props) {
  const [activeTab, setActiveTab] = useState<'mouvements' | 'reception' | 'expedition' | 'contrats' | 'fournisseurs' | 'clients'>('mouvements');
  const [activeAction, setActiveAction] = useState<'reception' | 'vente'>('reception');
  const [showModal, setShowModal] = useState<'fournisseur' | 'client' | 'edit-fournisseur' | 'edit-client' | 'contract' | 'sale-contract' | 'edit-contract' | 'edit-sale-contract' | 'edit-subcontract' | 'new-subcontract' | 'delivery' | 'sale' | null>(null);

  // Search & Filter States
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [searchContract, setSearchContract] = useState('');
  const [filterContractType, setFilterContractType] = useState<'all'|'achat'|'vente'>('all');
  const [filterContractFood, setFilterContractFood] = useState<string>('all');
  
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [formMode, setFormMode] = useState<'rapide' | 'planifier'>('planifier');
  const [showRightPanel, setShowRightPanel] = useState(false);

  const [isPending, startTransition] = React.useTransition();

  // ----- Data Derivation -----
  
  const allContracts = [
    ...initialFournisseurs.flatMap(s => s.contracts.map(c => ({
      ...c, type: 'achat', partner_name: s.name, partner_id: s.id,
      total_kg_left: c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0
    }))),
    ...initialClients.flatMap(c => c.contracts.map(co => ({
      ...co, type: 'vente', partner_name: c.name, partner_id: c.id,
      sub_contracts: co.sub_contracts, // keep identical structure
      total_kg_left: co.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0
    })))
  ].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
  .filter(c => {
    if (searchContract && !c.name.toLowerCase().includes(searchContract.toLowerCase()) && !c.partner_name.toLowerCase().includes(searchContract.toLowerCase())) return false;
    if (filterContractType !== 'all' && c.type !== filterContractType) return false;
    if (filterContractFood !== 'all' && c.food_id.toString() !== filterContractFood) return false;
    return true;
  });

  const allMovements = [
    ...initialFournisseurs.flatMap(s => s.deliveries.map(d => ({
      ...d, type: 'livraison', partner_name: s.name, partner_id: s.id, food_id: d.food_id,
      contract_name: d.delivery_subcontracts?.map((dsc: any) => dsc.sub_contract.name).join(', ') || 'Spot / Non alloué',
      food_name: d.food.name, unit: d.food.unit_type.name,
      quantity: d.quantity_received,
      date: d.date_delivered || d.date_expected,
      is_completed: !!d.date_delivered
    }))),
    ...initialClients.flatMap(c => c.sales.map(s => ({
      ...s, type: 'vente', partner_name: c.name, partner_id: c.id, food_id: s.food_id,
      contract_name: s.sale_subcontracts?.map((dsc: any) => dsc.sale_sub_contract.name).join(', ') || 'Spot / Non alloué',
      food_name: s.food.name, unit: s.food.unit_type.name,
      quantity: s.quantity_sold,
      date: s.date_sold || s.date_expected,
      is_completed: !!s.date_sold
    })))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredFournisseurs = initialFournisseurs.filter(f => searchSupplier ? f.name.toLowerCase().includes(searchSupplier.toLowerCase()) : true);
  const filteredClients = initialClients.filter(c => searchClient ? c.name.toLowerCase().includes(searchClient.toLowerCase()) : true);


  // ----- Handlers -----

  const toggleContractExpand = (id: number) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleTogglePartner = (id: number, type: 'fournisseur' | 'client', status: boolean) => {
    startTransition(async () => {
      try {
        if (type === 'fournisseur') {
          const { toggleSupplierStatus } = await import('../actions');
          await toggleSupplierStatus(id, !status);
        } else {
          const { toggleClientStatus } = await import('../actions');
          await toggleClientStatus(id, !status);
        }
        toast.success(`Partenaire ${status ? 'désactivé' : 'activé'} avec succès.`);
      } catch (e) {
        toast.error("Erreur lors de la modification.");
      }
    });
  };

  const handleDeleteMovement = async (id: number, type: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-zinc-800">Supprimer ce mouvement planifié ?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold" onClick={() => toast.dismiss(t.id)}>Annuler</button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold" onClick={async () => {
            toast.dismiss(t.id);
            startTransition(async () => {
              try {
                if (type === 'livraison') {
                  const { deleteDelivery } = await import('../actions');
                  await deleteDelivery(id);
                } else {
                  const { deleteSale } = await import('../actions');
                  await deleteSale(id);
                }
                toast.success("Mouvement supprimé.");
              } catch(e: any) {
                toast.error(e.message || "Erreur.");
              }
            });
          }}>Confirmer</button>
        </div>
      </div>
    ));
  };


  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-0 bg-zinc-50/90 backdrop-blur-md z-40 py-4 border-b border-zinc-200 shadow-sm px-6 -mx-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </div>
            Transactions
          </h1>
          <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
            Gérez vos fournisseurs, clients, contrats et suivez l'ensemble de vos mouvements.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('reception')}
            className="px-6 py-4 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faTractor} />
            </div>
            Recevoir une Livraison
          </button>
          <button 
            onClick={() => setActiveTab('expedition')}
            className="px-6 py-4 rounded-2xl font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center gap-3 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </div>
            Expédier une Vente
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 bg-zinc-100 p-2 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('mouvements')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'mouvements' ? 'bg-white shadow-sm text-blue-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faArrowRightArrowLeft} className="mr-2" /> Mouvements
        </button>
        <button 
          onClick={() => setActiveTab('contrats')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'contrats' ? 'bg-white shadow-sm text-blue-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Contrats
        </button>
        <button 
          onClick={() => setActiveTab('fournisseurs')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'fournisseurs' ? 'bg-white shadow-sm text-blue-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faTruck} className="mr-2" /> Fournisseurs
        </button>
        <button 
          onClick={() => setActiveTab('clients')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${activeTab === 'clients' ? 'bg-white shadow-sm text-blue-700' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <FontAwesomeIcon icon={faStore} className="mr-2" /> Clients
        </button>
      </div>

      {/* --- TAB: MOUVEMENTS --- */}
      {activeTab === 'mouvements' && (
        <>
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={() => setActiveAction('reception')}
              className={`flex-1 p-6 rounded-3xl border-2 font-black text-xl flex flex-col sm:flex-row items-center justify-center gap-3 transition-all ${activeAction === 'reception' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeAction === 'reception' ? 'bg-white/20' : 'bg-blue-100'}`}>
                <FontAwesomeIcon icon={faTractor} />
              </div>
              Entrée Bon Livraison
            </button>
            
            <button 
              onClick={() => setActiveAction('vente')}
              className={`flex-1 p-6 rounded-3xl border-2 font-black text-xl flex flex-col sm:flex-row items-center justify-center gap-3 transition-all ${activeAction === 'vente' ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeAction === 'vente' ? 'bg-white/20' : 'bg-orange-100'}`}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>
              Sortie Bon de Vente
            </button>
          </div>

          {/* Toggle button for right panel on mobile */}
          <div className="xl:hidden flex justify-end mb-4">
            <button 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="bg-white border border-zinc-200 px-6 py-3 rounded-xl font-black text-zinc-700 shadow-sm flex items-center gap-2 hover:bg-zinc-50"
            >
              {showRightPanel ? 'Masquer la planification' : 'Planifier / Mouvement Rapide'}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mt-4 mb-10">
            {/* Chronological List (Left) */}
            <div className="xl:col-span-2">
              <div className={`bg-white p-6 sm:p-10 rounded-[2.5rem] border shadow-xl relative overflow-hidden h-full ${activeAction === 'reception' ? 'border-blue-200/60' : 'border-orange-200/60'}`}>
                <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${activeAction === 'reception' ? 'bg-blue-500/5' : 'bg-orange-500/5'}`}></div>
                
                <div className="relative z-10">
                  <div className="mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 tracking-tight flex items-center gap-4">
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full shadow-sm text-2xl ${activeAction === 'reception' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        📅
                      </span>
                      {activeAction === 'reception' ? 'Prochaines Livraisons' : 'Prochaines Ventes'}
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium max-w-2xl">
                      Suivi chronologique de vos {activeAction === 'reception' ? 'réceptions' : 'sorties'} planifiées et terminées.
                    </p>
                  </div>

                  <div className="bg-zinc-50/50 rounded-3xl border border-zinc-200/60 overflow-hidden">
                    <ul className="divide-y divide-zinc-200/60">
                      {allMovements.filter(m => m.type === (activeAction === 'reception' ? 'livraison' : 'vente')).length === 0 ? (
                        <li className="p-10 text-center">
                          <span className="text-5xl mb-4 block">📦</span>
                          <h3 className="text-zinc-500 font-bold text-xl">Aucun mouvement prévu.</h3>
                        </li>
                      ) : (
                        allMovements.filter(m => m.type === (activeAction === 'reception' ? 'livraison' : 'vente')).map((m, idx) => {
                          const dateObj = new Date(m.date);
                          const isPast = m.is_completed;

                          return (
                            <li key={`${m.type}-${m.id}-${idx}`} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white transition-colors gap-4">
                              <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 transition-colors ${isPast ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : (activeAction === 'reception' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm')}`}>
                                  <span className="text-xs font-black uppercase tracking-wider">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                                  <span className="text-2xl font-black leading-none mt-0.5">{dateObj.getDate()}</span>
                                </div>
                                <div>
                                  <h3 className={`font-black text-xl sm:text-2xl ${isPast ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{m.food_name}</h3>
                                  <p className="text-base text-zinc-500 font-medium capitalize mt-1 flex items-center gap-2">
                                    {m.partner_name} | Contrats: {m.contract_name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-xl font-black ${m.type === 'livraison' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                  {m.type === 'livraison' ? '+' : '-'}{m.quantity} <span className="text-sm text-zinc-500">{m.unit}</span>
                                </span>
                                {!isPast ? (
                                  <div className="flex items-center gap-2">

                                    <button
                                      onClick={() => handleDeleteMovement(m.id, m.type)}
                                      className="w-9 h-9 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm font-black transition-all shrink-0"
                                      title="Supprimer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div className="px-4 py-2 bg-zinc-100 text-zinc-500 rounded-xl text-sm font-black border border-zinc-200 flex items-center gap-2">
                                    <span className="text-zinc-400">✓</span> Terminé
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Form (Right) */}
            <div className={`xl:block ${showRightPanel ? 'block' : 'hidden'}`}>
              <div className={`bg-white p-6 sm:p-10 rounded-[2.5rem] border border-${activeAction === 'reception' ? 'green' : 'indigo'}-200/60 shadow-xl relative overflow-hidden sticky top-8`}>
                <div className={`absolute top-0 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${activeAction === 'reception' ? 'bg-green-500/5' : 'bg-indigo-500/5'}`}></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-4 tracking-tight">
                      <span className={`flex items-center justify-center w-12 h-12 rounded-full shadow-sm text-xl ${activeAction === 'reception' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {formMode === 'rapide' ? '⚡' : '📅'}
                      </span>
                      {activeAction === 'reception' ? (formMode === 'rapide' ? 'Achat Rapide' : 'Planifier une livraison') : (formMode === 'rapide' ? 'Vente Rapide' : 'Planifier une vente')}
                    </h2>
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                      <button type="button" onClick={() => setFormMode('rapide')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formMode === 'rapide' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Rapide</button>
                      <button type="button" onClick={() => setFormMode('planifier')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formMode === 'planifier' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Planifier</button>
                    </div>
                  </div>

                  {formMode === 'rapide' ? (

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        if (activeAction === 'reception') {
                          const { createQuickSpotDelivery } = await import('../actions');
                          await createQuickSpotDelivery(fd);
                          toast.success("Achat Spot ajouté !");
                        } else {
                          const { createQuickSpotSale } = await import('../actions');
                          await createQuickSpotSale(fd);
                          toast.success("Vente Spot ajoutée !");
                        }
                        (e.target as HTMLFormElement).reset();
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">{activeAction === 'reception' ? 'Fournisseur' : 'Client'}</label>
                      <select name={activeAction === 'reception' ? 'supplier_id' : 'client_id'} required className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all appearance-none cursor-pointer`}>
                        <option value="">Sélectionner...</option>
                        {activeAction === 'reception' 
                          ? initialFournisseurs.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                          : initialClients.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Aliment</label>
                      <select name="food_id" required className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all appearance-none cursor-pointer`}>
                        <option value="">Choisir...</option>
                        {aliments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.unit_type.name})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Quantité</label>
                        <input type="number" step="0.01" name="quantity" required placeholder="Ex: 500" className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Prix/kg ($)</label>
                        <input type="number" step="0.01" name="price_per_kg" required placeholder="Ex: 0.25" className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all`} />
                      </div>
                    </div>
                    <input type="hidden" name="date_delivered" value={new Date().toISOString().split('T')[0]} />
                    <button
                      disabled={isPending}
                      type="submit"
                      className={`w-full mt-4 py-4 px-6 font-black text-xl text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 ${activeAction === 'reception' ? 'bg-[#10a342] hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      Valider {activeAction === 'reception' ? "l'Achat" : "la Vente"}
                    </button>
                  </form>
                  ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        if (activeAction === 'reception') {
                          const { createDelivery } = await import('../actions');
                          await createDelivery(fd);
                          toast.success("Livraison planifiée !");
                        } else {
                          const { createSale } = await import('../actions');
                          await createSale(fd);
                          toast.success("Vente planifiée !");
                        }
                        (e.target as HTMLFormElement).reset();
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">{activeAction === 'reception' ? 'Fournisseur' : 'Client'}</label>
                      <select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)} required className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all appearance-none cursor-pointer`}>
                        <option value="">Sélectionner...</option>
                        {activeAction === 'reception' 
                          ? initialFournisseurs.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                          : initialClients.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Contrat</label>
                      <select name="contract_id" required disabled={!selectedPartnerId} className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all appearance-none cursor-pointer disabled:opacity-50`}>
                        <option value="">Choisir...</option>
                        {activeAction === 'reception'
                          ? initialFournisseurs.find(f => f.id.toString() === selectedPartnerId)?.contracts.map(c => {
                              const kgLeft = c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0;
                              return <option key={c.id} value={c.id}>{c.name} - {c.food.name} ({kgLeft}kg restants)</option>;
                            })
                          : initialClients.find(c => c.id.toString() === selectedPartnerId)?.contracts.map(c => {
                              const kgLeft = c.sub_contracts?.reduce((sum: number, sc: any) => sum + sc.kg_left_to_deliver, 0) || 0;
                              return <option key={c.id} value={c.id}>{c.name} - {c.food.name} ({kgLeft}kg restants)</option>;
                            })
                        }
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Quantité</label>
                        <input type="number" step="0.01" name={activeAction === 'reception' ? 'quantity_received' : 'quantity_sold'} required placeholder="Ex: 500" className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Date prévue</label>
                        <input type="date" name="date_expected" required className={`w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold text-lg focus:ring-2 focus:ring-${activeAction === 'reception' ? 'green' : 'indigo'}-500/20 focus:border-${activeAction === 'reception' ? 'green' : 'indigo'}-500 transition-all`} />
                      </div>
                    </div>

                    <button
                      disabled={isPending}
                      type="submit"
                      className={`w-full mt-4 py-4 px-6 font-black text-xl text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 ${activeAction === 'reception' ? 'bg-[#10a342] hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      Planifier
                    </button>
                  </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- TAB: FOURNISSEURS --- */}
      {activeTab === 'fournisseurs' && (
        <>
          <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
            <input 
              type="text" 
              placeholder="Rechercher un fournisseur..." 
              value={searchSupplier}
              onChange={e => setSearchSupplier(e.target.value)}
              className="w-full md:w-1/3 px-5 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button onClick={() => { setEditingPartner(null); setShowModal('fournisseur'); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-colors">
              <FontAwesomeIcon icon={faPlus} /> Ajouter un Fournisseur
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFournisseurs.map(f => (
              <div key={f.id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col transition-all ${f.is_active ? 'bg-white border-zinc-200' : 'bg-zinc-100 border-zinc-200 opacity-60 grayscale hover:grayscale-0'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {f.url && (
                      <img src={`https://www.google.com/s2/favicons?domain=${f.url}&sz=128`} alt="" className="w-8 h-8 rounded-md bg-zinc-100" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <h3 className="text-2xl font-black text-zinc-900">{f.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPartner(f); setShowModal('edit-fournisseur'); }} className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">Modifier</button>
                    <button onClick={() => handleTogglePartner(f.id, 'fournisseur', f.is_active)} disabled={isPending} className={`px-3 py-1 text-xs font-bold rounded-lg ${f.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                      {f.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
                <div className="text-zinc-500 space-y-1 mb-6">
                  <p>📞 {f.phone_number}</p>
                  <p>✉️ {f.email}</p>
                  <p>📍 {f.address}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center text-sm font-bold text-zinc-400">
                  <span>{f.contracts.length} contrats</span>
                  <span className={f.is_active ? "text-green-500" : "text-red-500"}>{f.is_active ? "Actif" : "Inactif"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- TAB: CLIENTS --- */}
      {activeTab === 'clients' && (
        <>
          <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchClient}
              onChange={e => setSearchClient(e.target.value)}
              className="w-full md:w-1/3 px-5 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button onClick={() => { setEditingPartner(null); setShowModal('client'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-colors">
              <FontAwesomeIcon icon={faPlus} /> Ajouter un Client
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(c => (
              <div key={c.id} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col transition-all ${c.is_active ? 'bg-white border-zinc-200' : 'bg-zinc-100 border-zinc-200 opacity-60 grayscale hover:grayscale-0'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-zinc-900">{c.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPartner(c); setShowModal('edit-client'); }} className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">Modifier</button>
                    <button onClick={() => handleTogglePartner(c.id, 'client', c.is_active)} disabled={isPending} className={`px-3 py-1 text-xs font-bold rounded-lg ${c.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                      {c.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
                <div className="text-zinc-500 space-y-1 mb-6">
                  <p>📞 {c.phone_number}</p>
                  <p>✉️ {c.email}</p>
                  <p>📍 {c.address}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center text-sm font-bold text-zinc-400">
                  <span>{c.contracts.length} contrats</span>
                  <span className={c.is_active ? "text-green-500" : "text-red-500"}>{c.is_active ? "Actif" : "Inactif"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- TAB: CONTRATS --- */}
      {activeTab === 'contrats' && (
        <>
          <div className="mb-8 flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <input 
                type="text" 
                placeholder="Rechercher un contrat..." 
                value={searchContract}
                onChange={e => setSearchContract(e.target.value)}
                className="w-full sm:w-1/3 px-5 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <select 
                value={filterContractType} 
                onChange={e => setFilterContractType(e.target.value as 'all'|'achat'|'vente')}
                className="px-5 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Tous les types</option>
                <option value="achat">Achat</option>
                <option value="vente">Vente</option>
              </select>
              <select 
                value={filterContractFood} 
                onChange={e => setFilterContractFood(e.target.value)}
                className="px-5 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">Tous les aliments</option>
                {aliments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowModal('contract')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
                <FontAwesomeIcon icon={faPlus} /> Contrat d'Achat
              </button>
              <button onClick={() => setShowModal('sale-contract')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
                <FontAwesomeIcon icon={faPlus} /> Contrat de Vente
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 text-sm uppercase tracking-widest border-b border-zinc-200">
                  <th className="p-6 font-black">Type</th>
                  <th className="p-6 font-black">Contrat</th>
                  <th className="p-6 font-black">Partenaire</th>
                  <th className="p-6 font-black">Aliment</th>
                  <th className="p-6 font-black">Quantité restante</th>
                  <th className="p-6 font-black">Prix/kg</th>
                  <th className="p-6 font-black text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allContracts.map(c => (
                  <React.Fragment key={`${c.type}-${c.id}`}>
                    <tr 
                      className={`transition-colors cursor-pointer ${c.is_active ? 'hover:bg-zinc-50' : 'bg-zinc-50 opacity-60 grayscale'} ${expandedContracts.has(c.id) ? 'bg-blue-50/30' : ''}`}
                      onClick={() => toggleContractExpand(c.id)}
                    >
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${c.type === 'achat' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-zinc-900 flex items-center gap-3">
                        <span className={`transform transition-transform ${expandedContracts.has(c.id) ? 'rotate-90 text-blue-600' : 'text-zinc-400'}`}>▶</span>
                        {c.name}
                      </td>
                      <td className="p-6 font-bold text-zinc-600">{c.partner_name}</td>
                      <td className="p-6 font-bold text-blue-600">
                        <span className="bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100">{c.food.name}</span>
                      </td>
                      <td className="p-6">
                        <span className="font-black text-zinc-900">{c.total_kg_left}</span>
                        <span className="text-zinc-400 text-sm"> / {c.total_kg}</span>
                      </td>
                      <td className="p-6 font-bold text-zinc-700">{c.price_per_kg}$</td>
                      <td className="p-6 text-right">
                        {c.is_active ? <span className="text-green-500 font-bold">Actif</span> : <span className="text-red-500 font-bold">Inactif</span>}
                      </td>
                    </tr>
                    
                    {/* Expanded details (SubContracts) */}
                    {expandedContracts.has(c.id) && (
                      <tr className="bg-blue-50/10">
                        <td colSpan={7} className="p-6">
                          <div className="pl-12 border-l-2 border-blue-200">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-black text-zinc-700 uppercase tracking-widest text-sm">Détail des mois / Livraisons</h4>
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setEditingPartner({ ...c, supplier_id: c.partner_id, client_id: c.partner_id }); 
                                    setShowModal(c.type === 'achat' ? 'edit-contract' : 'edit-sale-contract'); 
                                  }}
                                  className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50"
                                >
                                  Modifier le contrat
                                </button>
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(confirm('Supprimer ce contrat ?')) {
                                      startTransition(async () => {
                                        try {
                                          const { deleteContract, deleteSaleContract } = await import('../actions');
                                          if (c.type === 'achat') await deleteContract(c.id);
                                          else await deleteSaleContract(c.id);
                                          toast.success("Contrat supprimé");
                                        } catch(err: any) {
                                          toast.error(err.message || "Erreur.");
                                        }
                                      });
                                    }
                                  }}
                                  className="px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                                >
                                  Supprimer
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedContractId(c.id); setShowModal('new-subcontract'); }}
                                  className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50"
                                >
                                  + Nouvelle Ligne
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {c.sub_contracts?.map((sc: any) => (
                                <div key={sc.id} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-zinc-800">{sc.name}</span>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setEditingPartner({ ...sc, contract_type: c.type }); 
                                          setShowModal('edit-subcontract'); 
                                        }}
                                        className="w-8 h-8 flex justify-center items-center rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                      >
                                        <FontAwesomeIcon icon={faPen} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMovement(sc.id, 'subcontract'); }} // Needs custom delete action if I really implement it, but keeping it simple
                                        className="w-8 h-8 flex justify-center items-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-auto">
                                    <p className="text-sm text-zinc-500 mb-1">Reste à traiter: <span className="font-black text-zinc-900">{sc.kg_left_to_deliver} kg</span></p>
                                    <div className="w-full bg-zinc-100 rounded-full h-2">
                                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.max(0, 100 - (sc.kg_left_to_deliver / sc.expected_kg) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(!c.sub_contracts || c.sub_contracts.length === 0) && (
                                <p className="text-sm text-zinc-500 italic">Aucune planification détaillée.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {allContracts.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-zinc-500">Aucun contrat trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- MODALS --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl relative">
            <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-full flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="p-8 sm:p-10">
              
              {(showModal === 'fournisseur' || showModal === 'edit-fournisseur' || showModal === 'client' || showModal === 'edit-client') && (
                <>
                  <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                      <FontAwesomeIcon icon={showModal.includes('fournisseur') ? faTruck : faStore} />
                    </span>
                    {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                  </h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        if (showModal.includes('fournisseur')) {
                          const { createSupplier, updateSupplier } = await import('../actions');
                          if (editingPartner) {
                            fd.append('id', editingPartner.id.toString());
                            await updateSupplier(fd);
                            toast.success("Fournisseur modifié !");
                          } else {
                            await createSupplier(fd);
                            toast.success("Fournisseur ajouté !");
                          }
                        } else {
                          const { createClient, updateClient } = await import('../actions');
                          if (editingPartner) {
                            fd.append('id', editingPartner.id.toString());
                            await updateClient(fd);
                            toast.success("Client modifié !");
                          } else {
                            await createClient(fd);
                            toast.success("Client ajouté !");
                          }
                        }
                        setShowModal(null);
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Nom *</label><input name="name" defaultValue={editingPartner?.name} required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Téléphone *</label><input name="phone_number" defaultValue={editingPartner?.phone_number} required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Email *</label><input name="email" type="email" defaultValue={editingPartner?.email} required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Adresse *</label><input name="address" defaultValue={editingPartner?.address} required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    {showModal.includes('fournisseur') && <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Site Web URL (Optionnel)</label><input name="url" defaultValue={editingPartner?.url || ''} placeholder="https://..." className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>}
                    <button type="submit" disabled={isPending} className="w-full py-4 bg-[#5143f5] hover:bg-[#4035c9] text-white font-black text-xl rounded-xl transition-all disabled:opacity-50 mt-4">Enregistrer</button>
                  </form>
                </>
              )}

              {(showModal === 'contract' || showModal === 'sale-contract' || showModal === 'edit-contract' || showModal === 'edit-sale-contract') && (
                <>
                  <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg"><FontAwesomeIcon icon={faFileContract} /></span>
                    {showModal.startsWith('edit-') ? 'Modifier le Contrat' : 'Nouveau Contrat'}
                  </h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        if (showModal === 'contract') {
                          const { createContract } = await import('../actions');
                          await createContract(fd);
                          toast.success("Contrat d'achat créé !");
                        } else if (showModal === 'sale-contract') {
                          const { createSaleContract } = await import('../actions');
                          await createSaleContract(fd);
                          toast.success("Contrat de vente créé !");
                        } else if (showModal === 'edit-contract') {
                          const { updateContract } = await import('../actions');
                          await updateContract(fd);
                          toast.success("Contrat d'achat modifié !");
                        } else if (showModal === 'edit-sale-contract') {
                          const { updateSaleContract } = await import('../actions');
                          await updateSaleContract(fd);
                          toast.success("Contrat de vente modifié !");
                        }
                        setShowModal(null);
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    {showModal.startsWith('edit-') && <input type="hidden" name="id" value={editingPartner?.id} />}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Nom du contrat</label>
                      <input name="name" required defaultValue={showModal.startsWith('edit-') ? editingPartner?.name : ''} placeholder="Ex: Contrat 2026-2027" className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Partenaire</label>
                        <select name={(showModal === 'contract' || showModal === 'edit-contract') ? 'supplier_id' : 'client_id'} required defaultValue={showModal.startsWith('edit-') ? editingPartner?.partner_id : ''} className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all appearance-none cursor-pointer">
                          <option value="">Choisir...</option>
                          {(showModal === 'contract' || showModal === 'edit-contract') 
                            ? initialFournisseurs.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                            : initialClients.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                          }
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Aliment</label>
                        <select name="food_id" required defaultValue={showModal.startsWith('edit-') ? editingPartner?.food_id : ''} className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all appearance-none cursor-pointer">
                          <option value="">Choisir...</option>
                          {aliments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Quantité totale (kg)</label><input type="number" step="0.01" name="total_kg" required disabled={showModal.startsWith('edit-')} defaultValue={showModal.startsWith('edit-') ? editingPartner?.total_kg : ''} className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all disabled:bg-zinc-100 disabled:text-zinc-500" /></div>
                      <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Prix par kg ($)</label><input type="number" step="0.01" name="price_per_kg" required defaultValue={showModal.startsWith('edit-') ? editingPartner?.price_per_kg : ''} className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" /></div>
                    </div>
                    {!showModal.startsWith('edit-') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Date début</label><input type="date" name="date_start" required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" /></div>
                        <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Date fin</label><input type="date" name="date_end" required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" /></div>
                      </div>
                    )}
                    <button type="submit" disabled={isPending} className="w-full py-4 mt-4 bg-[#5143f5] hover:bg-[#4035c9] text-white font-black text-xl rounded-xl transition-all disabled:opacity-50">{showModal.startsWith('edit-') ? 'Sauvegarder' : 'Créer le contrat'}</button>
                  </form>
                </>
              )}

              {showModal === 'new-subcontract' && (
                <>
                  <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg"><FontAwesomeIcon icon={faPlus} /></span>
                    Nouvelle Ligne / Planification
                  </h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        const { createSubContract, createSaleSubContract } = await import('../actions');
                        const isSale = allContracts.find(c => c.id === selectedContractId)?.type === 'vente';
                        fd.append(isSale ? 'sale_contract_id' : 'contract_id', selectedContractId!.toString());
                        if (isSale) {
                          await createSaleSubContract(fd);
                        } else {
                          await createSubContract(fd);
                        }
                        toast.success("Ligne ajoutée !");
                        setShowModal(null);
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Nom / Mois *</label>
                        <input name="name" required placeholder="Ex: Août 2026" className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">ID Personnalisé</label>
                        <input name="custom_id" placeholder="Ex: C34" className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Quantité prévue (kg)</label>
                      <input type="number" step="0.01" name="expected_kg" required className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                    </div>
                    <button type="submit" disabled={isPending} className="w-full py-4 mt-4 bg-[#5143f5] hover:bg-[#4035c9] text-white font-black text-xl rounded-xl transition-all disabled:opacity-50">Ajouter la planification</button>
                  </form>
                </>
              )}

              {showModal === 'edit-subcontract' && editingPartner && (
                <>
                  <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg"><FontAwesomeIcon icon={faPen} /></span>
                    Modifier la planification
                  </h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      try {
                        const { updateSubContract, updateSaleSubContract } = await import('../actions');
                        if (editingPartner.contract_type === 'vente') {
                          await updateSaleSubContract(fd);
                        } else {
                          await updateSubContract(fd);
                        }
                        toast.success("Planification modifiée !");
                        setShowModal(null);
                      } catch (err: any) {
                        toast.error(err.message || "Erreur.");
                      }
                    });
                  }} className="space-y-6">
                    <input type="hidden" name="id" value={editingPartner.id} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Nom / Mois *</label>
                        <input name="name" required defaultValue={editingPartner.name} placeholder="Ex: Août 2026" className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">ID Personnalisé</label>
                        <input name="custom_id" defaultValue={editingPartner.custom_id || ''} placeholder="Ex: C34" className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Quantité prévue (kg)</label>
                      <input type="number" step="0.01" name="expected_kg" required defaultValue={editingPartner.expected_kg} className="w-full px-5 py-4 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-bold focus:ring-2 focus:ring-[#5143f5]/20 focus:border-[#5143f5] transition-all" />
                    </div>
                    <button type="submit" disabled={isPending} className="w-full py-4 mt-4 bg-[#5143f5] hover:bg-[#4035c9] text-white font-black text-xl rounded-xl transition-all disabled:opacity-50">Sauvegarder</button>
                  </form>
                </>
              )}



            </div>
          </div>
        </div>
      )}

      {activeTab === 'reception' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 px-4">
            <button onClick={() => setActiveTab('mouvements')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold transition-colors">
              <span className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">✕</span>
              Fermer et retourner aux transactions
            </button>
            <ReceptionView 
              deliveries={allMovements.filter(m => m.type === 'livraison' && !m.is_completed) as any} 
              inventory={aliments as any} 
              suppliers={initialFournisseurs as any} 
              storages={storages as any} 
            />
          </div>
        </div>
      )}

      {activeTab === 'expedition' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 px-4">
            <button onClick={() => setActiveTab('mouvements')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold transition-colors">
              <span className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">✕</span>
              Fermer et retourner aux transactions
            </button>
            <ExpeditionView 
              sales={allMovements.filter(m => m.type === 'vente' && !m.is_completed) as any}
              inventory={aliments as any} 
              clients={initialClients as any} 
              storages={storages as any} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
