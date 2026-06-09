'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface ChartProps {
  data: any[];
  dataKey: string;
  color: string;
  label: string;
  unit: string;
  isArea?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border-2 border-zinc-200 rounded-xl shadow-xl">
        <p className="font-bold text-zinc-500 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-black text-lg" style={{ color: entry.color }}>
            {entry.name} : {entry.value} {entry.payload.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SingleLineChart({ data, dataKey, color, label, unit, isArea = false }: ChartProps) {
  const chartData = data.map(d => ({ ...d, unit }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {isArea ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function DualLineChart({ data, key1, key2, color1, color2, label1, label2 }: any) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontWeight: 'bold' }} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={key1} name={label1} stroke={color1} strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey={key2} name={label2} stroke={color2} strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
