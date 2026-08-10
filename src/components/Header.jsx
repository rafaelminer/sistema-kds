import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Zap, 
  Clock, 
  Wifi, 
  Filter, 
  RotateCcw,
  Sparkles,
  Layers,
  Trash2,
  Activity
} from 'lucide-react';

export default function Header({ 
  selectedSector, 
  setSelectedSector, 
  selectedChannel,
  setSelectedChannel,
  statusFilter, 
  setStatusFilter,
  audioEnabled, 
  setAudioEnabled,
  onOpenSimulator,
  onOpenSettings,
  isCloudConnected,
  ordersCount,
  onResetDemo,
  onClearDemo
}) {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const sectors = [
    { id: 'ALL', label: 'Todos os Setores' },
    { id: 'Cozinha', label: '🍳 Cozinha Hot' },
    { id: 'Sushibar', label: '🍣 Sushibar' },
    { id: 'Bar', label: '🍹 Bar & Drinks' },
    { id: 'Sobremesas', label: '🍰 Sobremesas' }
  ];

  const channels = [
    { id: 'ALL', label: 'Todos os Canais' },
    { id: 'GOOMER', label: '🍊 Goomer' },
    { id: 'IFOOD', label: '🔴 iFood' }
  ];

  const handleRunDiagnostic = () => {
    window.open('/api/debug-goomer', '_blank');
  };

  return (
    <header className="sticky top-0 z-30 glass-header shadow-2xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-black">
              <ChefHat className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  KDS Cozinha <span className="text-amber-400 text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 font-mono font-bold">MULTICANAL</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sincronizado Supabase Cloud (Goomer + iFood)
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center">
          
          {/* Channel Filters */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  selectedChannel === ch.id
                    ? ch.id === 'IFOOD' 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Sector Filters */}
          <div className="flex items-center gap-1">
            {sectors.map(sector => (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSector === sector.id
                    ? 'bg-slate-700 text-white font-extrabold border border-slate-600 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-750 hover:text-white border border-slate-800'
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          <div className="hidden md:flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
            <Clock className="w-4 h-4 text-amber-400" />
            {time.toLocaleTimeString('pt-BR')}
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Alerta Sonoro Ativado' : 'Alerta Sonoro Mutado'}
            className={`p-2 rounded-lg text-xs font-bold transition-all border ${
              audioEnabled 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Alternar Tela Cheia (TV/Monitor)"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleRunDiagnostic}
            title="Diagnóstico de Conexão Goomer em Tempo Real"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Diag. Goomer</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Simular Pedidos
          </button>

          <button
            onClick={onClearDemo}
            title="Zerar para Modo Real de Produção"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-750 border border-slate-700 transition-all text-xs font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Zerar p/ Modo Real</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Configurações de APIs & Tokens"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all hidden md:flex"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
