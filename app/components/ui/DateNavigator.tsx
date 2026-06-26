'use client';
import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

interface DateNavigatorProps {
  label?: string;
  selectedDate: string; // ISO format YYYY-MM-DD
  onChange: (date: string) => void;
  maxDate?: string;
}

export default function DateNavigator({ 
  label = "Date des données", 
  selectedDate, 
  onChange,
  maxDate
}: DateNavigatorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDateObj = new Date(selectedDate + 'T12:00:00');

  const handlePrevDay = () => {
    const newDate = new Date(currentDateObj);
    newDate.setDate(newDate.getDate() - 1);
    onChange(newDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDateObj);
    newDate.setDate(newDate.getDate() + 1);
    const newDateStr = newDate.toISOString().split('T')[0];
    if (maxDate && newDateStr > maxDate) return;
    onChange(newDateStr);
  };

  const isMaxReached = maxDate ? selectedDate >= maxDate : false;

  const formattedDate = currentDateObj.toLocaleDateString('fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border-2 border-zinc-200 shadow-sm relative group w-max">
      
      {/* Hidden native date input for quick jumping */}
      <input 
        ref={inputRef}
        type="date"
        value={selectedDate}
        max={maxDate}
        onChange={(e) => {
          if(e.target.value) onChange(e.target.value);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
      />

      <button 
        onClick={(e) => { e.preventDefault(); handlePrevDay(); }}
        className="relative z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col items-center min-w-[220px] pointer-events-none">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} /> {label}
        </span>
        <span className="font-black text-lg text-zinc-800 capitalize">{formattedDate}</span>
      </div>
      
      <button 
        onClick={(e) => { e.preventDefault(); handleNextDay(); }}
        disabled={isMaxReached}
        className="relative z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
      </button>
    </div>
  );
}
