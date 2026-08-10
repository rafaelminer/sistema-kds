import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Play, Check, AlertTriangle, User, RotateCcw } from 'lucide-react';

export default function OrderCard({ order, onUpdateStatus, warningMin = 10, urgentMin = 20, isCompact = false }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [elapsedFormatted, setElapsedFormatted] = useState('00:00');
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(order.created_at).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - created);
      
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      
      setElapsedMinutes(mins);
      setElapsedFormatted(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const toggleItemCheck = (itemId, e) => {
    e.stopPropagation();
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isUrgent = elapsedMinutes >= urgentMin;
  const isWarning = elapsedMinutes >= warningMin && !isUrgent;
  const isIfood = order.channel === 'IFOOD';

  const getStatusStyles = () => {
    switch (order.status) {
      case 'NOVO':
        return {
          cardBorder: isIfood ? 'border-red-500/90 glow-new-order' : 'border-amber-500/90 glow-new-order',
          headerBg: isIfood ? 'bg-gradient-to-r from-red-950 to-slate-900 border-red-800/80 text-red-100' : 'bg-gradient-to-r from-amber-950 to-slate-900 border-amber-800/80 text-amber-100',
          badgeBg: isIfood ? 'bg-red-600 text-white font-black' : 'bg-amber-500 text-slate-950 font-black',
          btnAction: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
        };
      case 'EM PREPARO':
        return {
          cardBorder: isUrgent ? 'timer-overdue border-red-500' : 'border-amber-500/70',
          headerBg: 'bg-gradient-to-r from-amber-950/90 to-slate-900 border-amber-800/60 text-amber-200',
          badgeBg: 'bg-amber-500 text-slate-950 font-black',
          btnAction: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
        };
      case 'PRONTO':
        return {
          cardBorder: 'border-emerald-500/70',
          headerBg: 'bg-gradient-to-r from-emerald-950/90 to-slate-900 border-emerald-800/60 text-emerald-200',
          badgeBg: 'bg-emerald-500 text-slate-950 font-black',
          btnAction: 'bg-slate-700 hover:bg-slate-600 text-white font-bold'
        };
      case 'CONCLUIDO':
      default:
        return {
          cardBorder: 'border-slate-800 opacity-60',
          headerBg: 'bg-slate-900 border-slate-800 text-slate-400',
          badgeBg: 'bg-slate-700 text-slate-300 font-bold',
          btnAction: 'bg-slate-800 text-slate-400'
        };
    }
  };

  const styles = getStatusStyles();

  const handleNextStatus = () => {
    if (order.status === 'NOVO') {
      onUpdateStatus(order.id, 'EM PREPARO');
    } else if (order.status === 'EM PREPARO') {
      onUpdateStatus(order.id, 'PRONTO');
      import('canvas-confetti').then((confettiModule) => {
        const confettiFn = confettiModule.default || confettiModule;
        confettiFn({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }).catch(() => {});
    } else if (order.status === 'PRONTO') {
      onUpdateStatus(order.id, 'CONCLUIDO');
    }
  };

  return (
    <div className={`rounded-2xl border bg-slate-900/90 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-card-in ${styles.cardBorder}`}>
      
      {/* Card Header with Channel Branding & Fast Bump */}
      <div 
        onClick={handleNextStatus}
        className={`px-4 py-3 border-b flex items-center justify-between gap-2 cursor-pointer select-none ${styles.headerBg}`}
      >
        <div className="flex items-center gap-2">
          
          {/* Channel Tag (iFood vs Goomer) */}
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase flex items-center gap-1 ${
            isIfood 
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
              : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
          }`}>
            {isIfood ? '🔴 iFood' : '🍊 Goomer'}
          </span>

          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-100">
            {order.ifood_id || order.goomer_id || order.id}
          </span>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center gap-1.5 font-mono-numbers text-xs font-black px-2.5 py-1 rounded-lg border ${
          isUrgent 
            ? 'bg-red-500/30 text-red-300 border-red-500/50 animate-pulse' 
            : isWarning 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
              : 'bg-slate-950/80 text-emerald-400 border-slate-800'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          {elapsedFormatted}
        </div>
      </div>

      {/* Table / Customer Info */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <span className={isIfood ? 'text-red-400' : 'text-amber-400'}>
              {order.table_or_client}
            </span>
          </h3>
          {order.customer_name && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
              <User className="w-3 h-3 text-slate-500" />
              {order.customer_name}
            </p>
          )}
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
          order.order_type === 'Delivery' 
            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
            : order.order_type === 'Mesa' 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        }`}>
          {order.order_type}
        </span>
      </div>

      {/* Items List */}
      <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[320px]">
        {order.items && order.items.map((item, idx) => {
          const isItemDone = checkedItems[item.id || idx];
          return (
            <div 
              key={item.id || idx}
              onClick={(e) => toggleItemCheck(item.id || idx, e)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isItemDone 
                  ? 'bg-slate-950/50 border-slate-800/50 opacity-40 line-through' 
                  : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                isItemDone ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-900'
              }`}>
                {isItemDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`font-bold text-sm text-slate-100 ${isItemDone ? 'line-through text-slate-400' : ''}`}>
                    <span className={`inline-block font-black px-1.5 py-0.5 rounded-md text-xs mr-2 ${
                      isIfood ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950 font-mono'
                    }`}>
                      {item.quantity}x
                    </span>
                    {item.name}
                  </span>
                </div>

                {item.obs && item.obs.trim() !== '' && (
                  <div className="mt-2 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/70 px-2.5 py-1.5 rounded-lg flex items-start gap-2 shadow-inner">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.obs}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
        {order.status !== 'NOVO' && (
          <button
            onClick={() => {
              const prev = order.status === 'PRONTO' ? 'EM PREPARO' : 'NOVO';
              onUpdateStatus(order.id, prev);
            }}
            title="Voltar status anterior"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {order.status !== 'CONCLUIDO' && (
          <button
            onClick={handleNextStatus}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${styles.btnAction}`}
          >
            {order.status === 'NOVO' && (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Preparo</span>
              </>
            )}
            {order.status === 'EM PREPARO' && (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar Pronto</span>
              </>
            )}
            {order.status === 'PRONTO' && (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Concluir / Entregar</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
