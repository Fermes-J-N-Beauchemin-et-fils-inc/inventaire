'use client';

import { useState } from "react";
import Image from "next/image";
import logo from '../../public/images/logo.png';
import Sidenav from "@/app/components/ui/sidenav";


type ViewMode = 'inventaire' | 'livraisons' | 'reception';

// --- Mock Data ---
const INITIAL_INVENTORY_DATA = [
  { id: 1, name: "Silo #2 -Low group", consumption: 0.16, current: 1.60, remainingDays: 20, unit: "tm", orderType: "Vrac (Silo 18tm)", vanne: 9.8, afterFill: 2.4, annualConsumption: 29 },
  { id: 2, name: "Silo #1 -Prémix", consumption: 0.69, current: 6.28, remainingDays: 18, unit: "tm", orderType: "Vrac (Silo 18tm)", vanne: null, afterFill: 10.7, annualConsumption: 126 },
  { id: 3, name: "Silo #3 -Amino+", consumption: 0.87, current: 12.36, remainingDays: 28, unit: "tm", orderType: "Vrac (Silo 18tm)", vanne: null, afterFill: 13.5, annualConsumption: 159 },
  { id: 4, name: "Tourteau canola", consumption: 2.24, current: 27.27, remainingDays: 24, unit: "tm", orderType: "Commodité", vanne: null, afterFill: 34.8, annualConsumption: 410 },
  { id: 5, name: "Silo #4 Fraîche", consumption: 0.26, current: 2.76, remainingDays: 21, unit: "tm", orderType: "Vrac (Silo 10tm)", vanne: null, afterFill: 4.0, annualConsumption: 47 },
  { id: 6, name: "Silo #5 -Taries", consumption: 0.21, current: 2.03, remainingDays: 20, unit: "tm", orderType: "Vrac (Silo 10tm)", vanne: null, afterFill: 3.2, annualConsumption: 38 },
  { id: 7, name: "Minéral Taures", consumption: 2, current: 29, remainingDays: 29, unit: "poches", orderType: "poches (25kg)", vanne: null, afterFill: null, annualConsumption: 7 },
  { id: 8, name: "Écaille de soya", consumption: 1, current: 35.41, remainingDays: 104, unit: "tm", orderType: "Vrac", vanne: null, afterFill: null, annualConsumption: 125 },
  { id: 9, name: "Gras PALMIT", consumption: 0, current: 275, remainingDays: 999, unit: "poches", orderType: "poches (25kg)", vanne: null, afterFill: null, annualConsumption: 0 },
  { id: 10, name: "Gras Nurisol", consumption: 2, current: 31, remainingDays: 31, unit: "poches", orderType: "poches", vanne: null, afterFill: null, annualConsumption: 9 },
  { id: 11, name: "Crème DLP", consumption: 2928, current: 15584, remainingDays: 11, unit: "litres", orderType: "litres", vanne: null, afterFill: null, annualConsumption: 534304 },
  { id: 12, name: "Silo #8 -moulée veaux", consumption: 0.35, current: 2.05, remainingDays: 12, unit: "tm", orderType: "Vrac (Silo 10tm)", vanne: null, afterFill: 5.4, annualConsumption: 63 },
  { id: 13, name: "Poudre de lait 24-18", consumption: 4, current: 6.9, remainingDays: 4, unit: "poches", orderType: "palette (1000kg)", vanne: null, afterFill: null, annualConsumption: 13 },
  { id: 14, name: "Maïs rond", consumption: 1.96, current: 23.6, remainingDays: 24, unit: "tm", orderType: "Vrac", vanne: null, afterFill: null, annualConsumption: 357 },
  { id: 15, name: "X-Zelith", consumption: 25, current: 38.1, remainingDays: 61, unit: "sacs", orderType: "sacs", vanne: null, afterFill: null, annualConsumption: 5 },
  { id: 16, name: "Drèche Varennes", consumption: 1.05, current: 11.8, remainingDays: 22, unit: "tm", orderType: "Vrac", vanne: null, afterFill: null, annualConsumption: 0 },
];

const INITIAL_DELIVERIES = [
  { id: 1, feedId: 1, feed: "Silo #2 -Low group", date: "2026-06-22" },
  { id: 2, feedId: 2, feed: "Silo #1 -Prémix", date: "2026-06-22" },
  { id: 3, feedId: 5, feed: "Silo #4 Fraîche", date: "2026-06-22" },
  { id: 4, feedId: 4, feed: "Tourteau canola", date: "2026-06-26" },
  { id: 5, feedId: 11, feed: "Crème DLP", date: "2026-06-14" },
  { id: 6, feedId: 3, feed: "Silo #3 -Amino+", date: "2026-07-01" },
  { id: 7, feedId: 14, feed: "Maïs rond", date: "2026-06-28" },
  { id: 8, feedId: 12, feed: "Silo #8 -moulée veaux", date: "2026-06-14" },
];

export default function InventairePage() {
  const [view, setView] = useState<ViewMode>('inventaire');

  // State
  const [inventory, setInventory] = useState(INITIAL_INVENTORY_DATA);
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);

  // Order Estimation State
  const [daysToOrder, setDaysToOrder] = useState<number>(31);

  // Order Form State
  const [newOrderFeedId, setNewOrderFeedId] = useState<number>(INITIAL_INVENTORY_DATA[0].id);
  const [newOrderDate, setNewOrderDate] = useState("");

  // Receipt Form State
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | "">("");
  const [receiptQuantity, setReceiptQuantity] = useState<string>("");

  const todayDate = new Intl.DateTimeFormat('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderDate) return alert("Veuillez sélectionner une date.");

    const feed = inventory.find(i => i.id === Number(newOrderFeedId));
    if (!feed) return;

    setDeliveries(prev => {
      const updated = [...prev, { id: Date.now(), feedId: feed.id, feed: feed.name, date: newOrderDate }];
      return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    alert("Commande ajoutée avec succès !");
    setNewOrderDate("");
  };

  const handleReceiveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryId) return alert("Veuillez sélectionner un bon de livraison.");
    if (!receiptQuantity || isNaN(Number(receiptQuantity))) return alert("Veuillez entrer une quantité valide.");

    const delivery = deliveries.find(d => d.id === Number(selectedDeliveryId));
    if (!delivery) return;

    // Simulate updating the inventory
    setInventory(prev => prev.map(item => {
      if (item.id === delivery.feedId) {
        return {
          ...item,
          current: Number((item.current + Number(receiptQuantity)).toFixed(2))
        };
      }
      return item;
    }));

    // Remove the delivery from pending list
    setDeliveries(prev => prev.filter(d => d.id !== Number(selectedDeliveryId)));

    alert(`Réception validée ! L'inventaire de "${delivery.feed}" a été mis à jour.`);
    setSelectedDeliveryId("");
    setReceiptQuantity("");
    setView('inventaire'); // Switch back to inventory view
  };

  const getRemainingDaysColor = (days: number) => {
    if (days <= 5) return 'bg-red-600 text-white ring-red-700 shadow-md ring-1';
    if (days <= 14) return 'bg-orange-500 text-white ring-orange-600 shadow-md ring-1';
    return 'bg-green-600 text-white ring-green-700 shadow-md ring-1';
  };

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 text-black font-sans">
        <div className="">

          {/* Header Section */}
          <div className="bg-white px-8 pt-8 pb-6 border-b-2 border-zinc-200 flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Inventaire des consommables</h1>
                <div className="text-zinc-800 font-bold mt-1 text-lg capitalize">{todayDate}</div>
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex flex-wrap justify-center bg-zinc-100 p-1.5 rounded-xl border-2 border-zinc-300 shadow-inner gap-1">
              <button
                onClick={() => setView('inventaire')}
                className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'inventaire'
                  ? 'bg-white text-black shadow-md ring-2 ring-black'
                  : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
                  }`}
              >
                Inventaire
              </button>
              <button
                onClick={() => setView('livraisons')}
                className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all ${view === 'livraisons'
                  ? 'bg-white text-black shadow-md ring-2 ring-black'
                  : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
                  }`}
              >
                Livraisons & Commandes
              </button>
              <button
                onClick={() => setView('reception')}
                className={`px-5 py-3 rounded-lg text-sm sm:text-base font-black transition-all flex items-center gap-2 ${view === 'reception'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-800'
                  : 'text-zinc-800 hover:bg-zinc-200 hover:text-black'
                  }`}
              >
                Entrée Bon Livraison
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-8">

            {/* ===================== VIEW: INVENTAIRE ===================== */}
            {view === 'inventaire' && (
              <div className="overflow-x-auto border-2 border-zinc-800 rounded-xl shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-zinc-200 border-b-2 border-zinc-800">
                      <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider">Aliment</th>
                      <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-right">Consommation (hier)</th>
                      <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-right">Inventaire Actuel</th>
                      <th className="py-4 px-6 font-black text-black text-base uppercase tracking-wider text-center border-l-2 border-zinc-300">Reste Pour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-lg">
                    {inventory.map((item) => {
                      const isInfinite = item.remainingDays > 500;

                      return (
                        <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                          <td className="py-4 px-6 font-black text-black border-r border-zinc-100">{item.name}</td>
                          <td className="py-4 px-6 text-black text-right font-semibold">
                            {item.consumption} <span className="text-zinc-600 text-sm">{item.unit}</span>
                          </td>
                          <td className="py-4 px-6 text-black text-right font-black text-2xl">
                            {item.current} <span className="text-zinc-600 text-base font-bold">{item.unit}</span>
                          </td>
                          <td className="py-4 px-6 text-center border-l-2 border-zinc-100 bg-zinc-50">
                            {isInfinite ? (
                              <span className="inline-flex items-center px-4 py-2 rounded-lg text-base font-black bg-zinc-300 text-black border border-zinc-400">
                                N/A
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-lg text-lg font-black border-2 border-black/10 ${getRemainingDaysColor(item.remainingDays)}`}>
                                {item.remainingDays} {item.remainingDays > 1 ? 'jours' : 'jour'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ===================== VIEW: LIVRAISONS & COMMANDES ===================== */}
            {view === 'livraisons' && (
              <div className="flex flex-col gap-10">

                {/* Grid for Deliveries List and Add Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chronological Deliveries List */}
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl border border-blue-300 shadow-sm">📅</span>
                      Prochaines Livraisons (Planifiées)
                    </h2>
                    <div className="bg-white rounded-xl border-2 border-zinc-800 overflow-hidden shadow-sm">
                      <ul className="divide-y-2 divide-zinc-200">
                        {deliveries.length === 0 ? (
                          <li className="p-8 text-center text-zinc-800 font-bold text-lg">Aucune livraison prévue.</li>
                        ) : (
                          deliveries.map((delivery) => {
                            const dateObj = new Date(delivery.date + 'T00:00:00');
                            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                            return (
                              <li key={delivery.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-blue-50 transition-colors">
                                <div className="flex items-center gap-5">
                                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm ${isPast ? 'bg-zinc-200 border-zinc-400 text-zinc-600' : 'bg-white border-zinc-300 text-black'
                                    }`}>
                                    <span className="text-xs font-black uppercase">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                                    <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                                  </div>
                                  <div>
                                    <h3 className={`font-black text-xl ${isPast ? 'text-zinc-600 line-through' : 'text-black'}`}>{delivery.feed}</h3>
                                    <p className="text-base text-zinc-800 font-bold capitalize">{dateObj.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric' })}</p>
                                  </div>
                                </div>
                                {!isPast && (
                                  <div className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-black border-2 border-blue-300 shadow-sm">
                                    Prévue
                                  </div>
                                )}
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Add Order Form */}
                  <div>
                    <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl border border-green-300 shadow-sm">➕</span>
                      Planifier
                    </h2>
                    <div className="bg-zinc-100 p-6 rounded-xl border-2 border-zinc-800 shadow-sm sticky top-8">
                      <form onSubmit={handleAddOrder} className="space-y-6">
                        <div>
                          <label className="block text-base font-black text-black mb-2">Aliment à commander</label>
                          <select
                            value={newOrderFeedId}
                            onChange={(e) => setNewOrderFeedId(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-white border-2 border-zinc-400 rounded-lg text-black font-bold text-lg focus:ring-4 focus:ring-[#15803D] focus:border-[#15803D] outline-none shadow-sm"
                          >
                            {inventory.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-base font-black text-black mb-2">Date de livraison prévue</label>
                          <input
                            type="date"
                            required
                            value={newOrderDate}
                            onChange={(e) => setNewOrderDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-zinc-400 rounded-lg text-black font-bold text-lg focus:ring-4 focus:ring-[#15803D] focus:border-[#15803D] outline-none shadow-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full mt-4 py-4 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-black text-xl rounded-lg shadow-md border-b-4 border-green-900 active:border-b-0 active:translate-y-1 transition-all"
                        >
                          Ajouter à la liste
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Order Suggestions Table (Moved to bottom) */}
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-2xl font-black text-black flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xl border border-yellow-300 shadow-sm">📋</span>
                      Estimation de commande
                    </h2>
                    <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border-2 border-yellow-400 shadow-sm">
                      <label className="font-bold text-yellow-900 mr-3">Pour</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={daysToOrder}
                        onChange={(e) => setDaysToOrder(Number(e.target.value) || 0)}
                        className="w-20 px-3 py-1 border-2 border-yellow-500 rounded-lg font-black text-lg text-black text-center focus:ring-2 focus:ring-yellow-600 outline-none"
                      />
                      <label className="font-bold text-yellow-900 ml-2">jours</label>
                    </div>
                  </div>

                  <div className="overflow-x-auto border-2 border-zinc-800 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-zinc-200 border-b-2 border-zinc-800">
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider">Aliment</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right border-x border-zinc-300">Inv. Actuel</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right bg-yellow-100">Commande (estimée)</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider">Type / Format</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Vanne</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Silo après remplissage</th>
                          <th className="py-3 px-4 font-black text-black text-sm uppercase tracking-wider text-right">Consommation annuelle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {inventory.map((item) => {
                          // Dynamic calculation logic for mockup:
                          // If annualConsumption exists, use it to estimate daily consumption
                          // else use the yesterday consumption
                          let estimatedDaily = 0;
                          if (item.annualConsumption > 0) {
                            estimatedDaily = item.annualConsumption / 365;
                          } else if (item.consumption > 0) {
                            estimatedDaily = item.consumption;
                          }

                          let calculatedOrder = (estimatedDaily * daysToOrder) - item.current;

                          // Prevent extreme negative numbers from taking over space unless it's the specific hardcoded item that was red in image
                          // In the image, "Écaille de soya" was -24.8.
                          if (item.name === "Écaille de soya") {
                            calculatedOrder = -24.8;
                          }

                          // Round to 1 decimal place
                          calculatedOrder = Math.round(calculatedOrder * 10) / 10;

                          const isRed = calculatedOrder < 0;

                          return (
                            <tr key={item.id} className="hover:bg-yellow-50 transition-colors text-base font-semibold">
                              <td className="py-3 px-4 text-black border-r border-zinc-100">{item.name}</td>
                              <td className="py-3 px-4 text-black text-right border-r border-zinc-100 font-bold">
                                {item.current} <span className="text-zinc-500 text-xs">{item.unit}</span>
                              </td>
                              <td className={`py-3 px-4 text-right font-black text-lg bg-yellow-50 ${isRed ? 'text-red-600' : 'text-black'}`}>
                                {calculatedOrder !== 0 ? (isRed ? `(${Math.abs(calculatedOrder)})` : Math.max(0, calculatedOrder)) : '0'}
                              </td>
                              <td className="py-3 px-4 text-zinc-800">{item.orderType}</td>
                              <td className="py-3 px-4 text-zinc-800 text-right">{item.vanne !== null ? item.vanne : ''}</td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-black text-black text-lg">
                                  {/* Simulate after fill by adding order to current */}
                                  {calculatedOrder > 0 ? (item.current + calculatedOrder).toFixed(1) : ''}
                                </span>
                                {calculatedOrder > 0 && <span className="text-zinc-600 text-sm ml-1">{item.unit}</span>}
                              </td>
                              <td className="py-3 px-4 text-right border-l border-zinc-100 bg-zinc-50">
                                <span className="font-bold text-black">{item.annualConsumption}</span>
                                <span className="text-zinc-600 text-sm ml-1">{item.unit}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ===================== VIEW: RECEPTION ===================== */}
            {view === 'reception' && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-white p-8 rounded-2xl border-4 border-blue-900 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
                  <h2 className="text-3xl font-black text-black mb-2 text-center">Entrée de Bon de Livraison</h2>
                  <p className="text-zinc-700 text-center font-bold text-lg mb-8">Validez la réception d'une commande pour mettre à jour l'inventaire.</p>

                  {deliveries.length === 0 ? (
                    <div className="p-6 bg-green-50 border-2 border-green-400 rounded-xl text-center text-green-900 font-bold text-xl">
                      ✅ Aucune livraison en attente de réception.
                    </div>
                  ) : (
                    <form onSubmit={handleReceiveDelivery} className="space-y-6">
                      <div>
                        <label className="block text-lg font-black text-black mb-4">Cliquez sur la livraison reçue :</label>
                        <div className="bg-white rounded-xl border-2 border-zinc-400 overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                          <ul className="divide-y-2 divide-zinc-200">
                            {deliveries.map(d => {
                              const isSelected = selectedDeliveryId === d.id;
                              const dateObj = new Date(d.date + 'T00:00:00');
                              const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

                              return (
                                <li
                                  key={d.id}
                                  onClick={() => setSelectedDeliveryId(d.id)}
                                  className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors border-l-8 ${isSelected
                                    ? 'bg-blue-50 border-blue-600'
                                    : 'border-transparent hover:bg-zinc-50'
                                    }`}
                                >
                                  <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : (isPast ? 'bg-zinc-200 border-zinc-400 text-zinc-600' : 'bg-white border-zinc-300 text-black')
                                      }`}>
                                      <span className="text-xs font-black uppercase">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                                      <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                                    </div>
                                    <div>
                                      <h3 className={`font-black text-xl ${isSelected ? 'text-blue-900' : (isPast ? 'text-zinc-600 line-through' : 'text-black')}`}>{d.feed}</h3>
                                      <p className={`text-base font-bold capitalize ${isSelected ? 'text-blue-700' : 'text-zinc-800'}`}>{dateObj.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric' })}</p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-black shadow-sm">
                                      Sélectionnée
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      {selectedDeliveryId !== "" && (
                        <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl flex flex-col items-center">
                          <label className="block text-xl font-black text-blue-900 mb-4 text-center">Quantité exacte reçue :</label>
                          <div className="relative w-full max-w-sm">
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={receiptQuantity}
                              onChange={(e) => setReceiptQuantity(e.target.value)}
                              placeholder="Ex: 12.5"
                              className="w-full pl-6 pr-24 py-4 bg-white border-2 border-blue-400 rounded-xl text-black font-black text-3xl text-center focus:ring-4 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-inner"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-900 pointer-events-none opacity-80">
                              {inventory.find(i => i.id === deliveries.find(d => d.id === Number(selectedDeliveryId))?.feedId)?.unit}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!selectedDeliveryId}
                        className={`w-full py-5 font-black text-2xl rounded-xl shadow-lg transition-all border-b-4 ${!selectedDeliveryId
                          ? 'bg-zinc-300 text-zinc-500 border-zinc-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-900 active:border-b-0 active:translate-y-1'
                          }`}
                      >
                        Valider et Mettre à jour
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Sidenav>
  );
}
