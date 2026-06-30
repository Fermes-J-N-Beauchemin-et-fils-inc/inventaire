'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { costBreakdownData } from '../lib/mockChartData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';

export default function CostBreakdownChart() {
  return (
    <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm col-span-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black text-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartPie} />
          </div>
          Répartition Coûts
        </h3>
      </div>
      
      <div className="h-[320px] w-full flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={costBreakdownData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {costBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 700 }}
              formatter={(value: any, _name: any, _item: any, _index: any, _payload: any) => [`${value}%`, 'Proportion']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontWeight: 600, fontSize: '13px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text overlay */}
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-3xl font-black text-zinc-900">100%</p>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</p>
        </div>
      </div>
    </div>
  );
}
