import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: IconDefinition;
  trend?: {
    value: number; // Percentage
    isPositiveGood?: boolean; // If true, positive trend is green. If false, positive trend is red (e.g. for costs)
  };
  colorTheme?: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'zinc';
  onClick?: () => void;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  colorTheme = 'blue',
  onClick
}: StatCardProps) {
  
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    zinc: 'bg-zinc-50 text-zinc-600 border-zinc-200',
  };

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return 'text-zinc-500 bg-zinc-100';
    const isPositive = trend.value > 0;
    const isGood = trend.isPositiveGood !== undefined ? trend.isPositiveGood : true;
    
    if (isPositive) {
      return isGood ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
    } else {
      return isGood ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-6 border-2 border-zinc-100 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colorMap[colorTheme]}`}>
          <FontAwesomeIcon icon={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${getTrendColor()}`}>
            <FontAwesomeIcon icon={trend.value > 0 ? faArrowUp : trend.value < 0 ? faArrowDown : faMinus} className="text-xs" />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-zinc-500 font-bold text-lg mb-1">{title}</h3>
        <p className="text-4xl font-black text-zinc-900 tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-zinc-400 font-medium text-sm mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
