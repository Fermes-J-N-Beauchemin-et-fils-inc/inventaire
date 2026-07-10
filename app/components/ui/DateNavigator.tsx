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
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDateObj);
    newDate.setDate(newDate.getDate() + 1);
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateStr = `${year}-${month}-${day}`;
    
    if (maxDate && newDateStr > maxDate) return;
    onChange(newDateStr);
  };

  const isMaxReached = maxDate ? selectedDate >= maxDate : false;

  const formattedDate = currentDateObj.toLocaleDateString('fr-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border-2 border-zinc-200 shadow-sm relative group w-max">
      
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrevDay(); }}
        className="relative z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
      </button>
      
      <div 
        className="relative flex flex-col items-center min-w-[220px] cursor-pointer"
        onClick={() => {
          const input = inputRef.current as any;
          if (input) {
            if (input.showPicker) {
              try {
                input.showPicker();
              } catch (e) {
                input.focus();
              }
            } else {
              input.focus();
            }
          }
        }}
      >
        <input 
          ref={inputRef}
          type="date"
          value={selectedDate}
          max={maxDate}
          onChange={(e) => {
            if(e.target.value) onChange(e.target.value);
          }}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} /> {label}
          </span>
          <span className="font-black text-lg text-zinc-800 capitalize">{formattedDate}</span>
        </div>
      </div>
      
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextDay(); }}
        disabled={isMaxReached}
        className="relative z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
      </button>
    </div>
  );
}
