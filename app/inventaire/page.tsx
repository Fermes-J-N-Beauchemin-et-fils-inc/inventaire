'use client';

import { useState } from "react";
import Sidenav from "@/app/components/ui/sidenav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem, DeliveryItem } from "./types";
import InventaireTable from "./components/InventaireTable";
import LivraisonsView from "./components/LivraisonsView";
import OrderEstimation from "./components/OrderEstimation";
import ReceptionView from "./components/ReceptionView";

type ViewMode = 'inventaire' | 'livraisons' | 'reception';

// --- Mock Data ---
const INITIAL_INVENTORY_DATA: InventoryItem[] = [
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

const INITIAL_DELIVERIES: DeliveryItem[] = [
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
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY_DATA);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(INITIAL_DELIVERIES);

  // Order Estimation State
  const [daysToOrder, setDaysToOrder] = useState<number>(31);

  // Order Form State
  const [newOrderFeedId, setNewOrderFeedId] = useState<number>(INITIAL_INVENTORY_DATA[0].id);
  const [newOrderDate, setNewOrderDate] = useState("");

  // Receipt Form State
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | "">("");
  const [receiptQuantity, setReceiptQuantity] = useState<string>("");

  // Date
  const todayDate = new Date().toLocaleDateString('fr-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

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

  return (
    <Sidenav>
      <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 text-black font-sans">
        <div className="">
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                Inventaire des consommables
              </h1>
              <p className="text-xl text-zinc-500 font-medium mt-4 max-w-3xl">
                Gérez vos stocks, commandes et réceptions d'aliments au quotidien. <span className="capitalize">{todayDate}</span>
              </p>
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
          <div className="p-4 sm:p-8 bg-white rounded-b-xl border-t-0 border border-zinc-200 shadow-sm">
            {view === 'inventaire' && (
              <InventaireTable inventory={inventory} />
            )}

            {view === 'livraisons' && (
              <div className="flex flex-col gap-10">
                <LivraisonsView
                  deliveries={deliveries}
                  inventory={inventory}
                  newOrderFeedId={newOrderFeedId}
                  setNewOrderFeedId={setNewOrderFeedId}
                  newOrderDate={newOrderDate}
                  setNewOrderDate={setNewOrderDate}
                  handleAddOrder={handleAddOrder}
                />
                <OrderEstimation
                  inventory={inventory}
                  daysToOrder={daysToOrder}
                  setDaysToOrder={setDaysToOrder}
                />
              </div>
            )}

            {view === 'reception' && (
              <ReceptionView
                deliveries={deliveries}
                inventory={inventory}
                selectedDeliveryId={selectedDeliveryId}
                setSelectedDeliveryId={setSelectedDeliveryId}
                receiptQuantity={receiptQuantity}
                setReceiptQuantity={setReceiptQuantity}
                handleReceiveDelivery={handleReceiveDelivery}
              />
            )}
          </div>
        </div>
      </div>
    </Sidenav>
  );
}
