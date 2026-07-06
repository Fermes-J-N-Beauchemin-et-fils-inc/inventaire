'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faCircle, faCow } from '@fortawesome/free-solid-svg-icons';

import toast from 'react-hot-toast';

interface GroupData {
  id: number;
  name: string;
  count: number;
  category: string;
}

export default function LiveHerdView({ isAdmin = false }: { isAdmin?: boolean }) {
  const [data, setData] = useState<GroupData[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeAgo, setTimeAgo] = useState('à l\'instant');
  const [isEditing, setIsEditing] = useState(false);
  const [draftData, setDraftData] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/laitier/live-cows');
      const result = await res.json();
      if (result.success) {
        setData(result.groups);
        setLastFetched(new Date(result.timestamp));
        // Initialize draft data
        const initialDraft: Record<number, string> = {};
        result.groups.forEach((g: GroupData) => {
           initialDraft[g.id] = g.count.toString();
        });
        setDraftData(initialDraft);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastFetched) return;
      const seconds = Math.floor((new Date().getTime() - lastFetched.getTime()) / 1000);
      if (seconds < 10) setTimeAgo('à l\'instant');
      else if (seconds < 60) setTimeAgo(`il y a ${seconds}s`);
      else setTimeAgo(`il y a ${Math.floor(seconds / 60)}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastFetched]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.keys(draftData).map(id => ({
        id: parseInt(id),
        count: parseInt(draftData[parseInt(id)]) || 0
      }));

      const res = await fetch('/api/laitier/live-cows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        toast.success("Effectif mis à jour !");
        setIsEditing(false);
        await fetchData(); // Refresh data
      } else {
        toast.error("Erreur lors de la sauvegarde.");
      }
    } catch (e) {
      toast.error("Erreur de connexion.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftChange = (id: number, value: string) => {
     setDraftData(prev => ({ ...prev, [id]: value }));
  };

  // Group the data by category
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, GroupData[]>);

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon icon={faCow} />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
              Effectif du Troupeau
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider ml-2">
                <FontAwesomeIcon icon={faCircle} className="w-2 h-2 animate-pulse" /> Live
              </span>
            </h2>
            <p className="text-sm font-medium text-zinc-500 mt-0.5">Données synchronisées en temps réel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-400">
            {lastFetched ? `Actualisé ${timeAgo}` : 'Chargement...'}
          </span>
          <button 
            onClick={fetchData} 
            disabled={loading || isEditing}
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 flex items-center justify-center transition-all disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} />
          </button>
          
          {isAdmin && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Modifier
            </button>
          )}
          {isAdmin && isEditing && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                disabled={isSaving}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? "En cours..." : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedData).map(([category, items]) => {
            // For total, use draft values if editing
            const total = items.reduce((sum, item) => {
                const val = isEditing ? parseInt(draftData[item.id]) || 0 : item.count;
                return sum + val;
            }, 0);
            
            // Assign colors based on category
            let colorClass = "bg-zinc-50 border-zinc-200 text-zinc-800";
            let dotClass = "bg-zinc-400";
            if (category === 'En Lait') { colorClass = "bg-blue-50 border-blue-100 text-blue-900"; dotClass = "bg-blue-500"; }
            if (category === 'Relève') { colorClass = "bg-green-50 border-green-100 text-green-900"; dotClass = "bg-green-500"; }
            if (category === 'Taries') { colorClass = "bg-yellow-50 border-yellow-100 text-yellow-900"; dotClass = "bg-yellow-500"; }
            if (category === 'Bœuf') { colorClass = "bg-orange-50 border-orange-100 text-orange-900"; dotClass = "bg-orange-500"; }

            return (
              <div key={category} className={`p-4 rounded-xl border ${colorClass} ${isEditing ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
                    {category}
                  </h3>
                  <span className="text-xl font-black">{total}</span>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="opacity-80 font-medium">{item.name}</span>
                      {isEditing ? (
                          <input 
                              type="number"
                              min="0"
                              value={draftData[item.id] !== undefined ? draftData[item.id] : item.count}
                              onChange={(e) => handleDraftChange(item.id, e.target.value)}
                              className="w-16 px-2 py-1 text-right font-bold bg-white border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      ) : (
                          <span className="font-bold bg-white/50 px-2 py-0.5 rounded">{item.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
