import React from 'react';

export interface ReportRowProps {
  name: string;
  v1: string;
  v2: string;
  highlight?: string;
  extra?: string;
  extraColor?: string;
}

export default function ReportRow({ name, v1, v2, highlight = "", extra = "", extraColor = "" }: ReportRowProps) {
  return (
    <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] print:grid-cols-[1fr_60px_60px] items-center border-b border-zinc-300 py-[4px] relative text-black">
      <div className={`pl-2 pr-1 truncate ${highlight}`}>{name}</div>
      <div className={`text-center font-bold border-l border-zinc-300 ${highlight}`}>{v1}</div>
      <div className="text-center border-l border-zinc-300 font-medium">{v2}</div>
      {extra && <div className={`absolute left-full ml-1 sm:ml-2 top-1/2 -translate-y-1/2 ${extraColor}`}>{extra}</div>}
    </div>
  );
}
