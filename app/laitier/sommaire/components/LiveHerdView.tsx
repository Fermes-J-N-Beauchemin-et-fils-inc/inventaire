'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faCircle, faCow } from '@fortawesome/free-solid-svg-icons';

interface GroupData {
  id: number;
  name: string;
  count: number;
  category: string;
}

export default function LiveHerdView() {
  const [data, setData] = useState<GroupData[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeAgo, setTimeAgo] = useState('à l\'instant');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/laitier/live-cows');
      const result = await res.json();
      if (result.success) {
        setData(result.groups);
        setLastFetched(new Date(result.timestamp));
      }
    } catch (e) {
      console.error(e);
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
            disabled={loading}
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 flex items-center justify-center transition-all disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedData).map(([category, items]) => {
            const total = items.reduce((sum, item) => sum + item.count, 0);
            
            // Assign colors based on category
            let colorClass = "bg-zinc-50 border-zinc-200 text-zinc-800";
            let dotClass = "bg-zinc-400";
            if (category === 'En Lait') { colorClass = "bg-blue-50 border-blue-100 text-blue-900"; dotClass = "bg-blue-500"; }
            if (category === 'Relève') { colorClass = "bg-green-50 border-green-100 text-green-900"; dotClass = "bg-green-500"; }
            if (category === 'Taries') { colorClass = "bg-yellow-50 border-yellow-100 text-yellow-900"; dotClass = "bg-yellow-500"; }
            if (category === 'Bœuf') { colorClass = "bg-orange-50 border-orange-100 text-orange-900"; dotClass = "bg-orange-500"; }

            return (
              <div key={category} className={`p-4 rounded-xl border ${colorClass}`}>
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
                      <span className="font-bold bg-white/50 px-2 py-0.5 rounded">{item.count}</span>
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
