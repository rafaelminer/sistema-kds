import React, { useState } from 'react';
import { Flame, ChevronDown, ChevronUp, Layers, PackageCheck } from 'lucide-react';

export default function AllDayPrepSummary({ orders }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter active orders
  const activeOrders = orders.filter(o => o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO');

  // Aggregate items count across all active orders
  const itemCounts = {};
  activeOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const name = item.name || 'Item sem nome';
      const qty = parseInt(item.quantity || 1, 10);
      itemCounts[name] = (itemCounts[name] || 0) + qty;
    });
  });

  const summaryList = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);

  if (summaryList.length === 0) return null;

  return (
    <div className="mb-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Summary Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-950 transition-all select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
              Resumo de Produção em Lote <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">ALL-DAY PREP</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            <strong className="text-amber-400 font-extrabold">{summaryList.length}</strong> itens a preparar
          </span>
          <button className="text-slate-400 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Items Pills Grid */}
      {isExpanded && (
        <div className="p-3 flex flex-wrap items-center gap-2 max-h-[140px] overflow-y-auto">
          {summaryList.map(([itemName, count]) => (
            <div 
              key={itemName}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-sm hover:border-amber-500/50 transition-all"
            >
              <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">
                {count}x
              </span>
              <span className="text-xs font-bold text-slate-100">{itemName}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
