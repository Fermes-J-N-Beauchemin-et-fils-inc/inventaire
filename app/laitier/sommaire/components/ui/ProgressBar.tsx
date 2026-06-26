import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number; // Current value
  max: number; // Max possible value for scaling
  color?: string;
  formatValue?: (val: number) => string;
}

export default function ProgressBar({ label, value, max, color = 'bg-blue-600', formatValue }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-1">
        <span className="font-bold text-zinc-700">{label}</span>
        <span className="font-black text-zinc-900">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
