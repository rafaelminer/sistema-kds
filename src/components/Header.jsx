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
  Trash2
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

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl px-4 py-3">
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
                  KDS Cozinha <span className="text-amber-400 text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 font-mono">MULTICANAL</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isCloudConnected ? 'Sincronizado Supabase Cloud (Goomer + iFood)' : 'Modo Demonstrativo (Goomer + iFood)'}
              </p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1 font-mono text-sm font-bold text-amber-400 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            {time.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Filters: Channel & Sector */}
        <div className="flex flex-col sm:flex-row items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          
          {/* Channel Filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSector === sector.id
                    ? 'bg-slate-700 text-white font-extrabold border border-slate-600'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-750 hover:text-white'
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          <div className="hidden md:flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-inner">
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
            onClick={onOpenSimulator}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-red-600 hover:brightness-110 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Simular Pedidos
          </button>

          <button
            onClick={onResetDemo}
            title="Restaurar Pedidos Demonstrativos"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClearDemo}
            title="Limpar Pedidos Fictícios (Pronto para Pedidos Reais)"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 text-xs font-bold transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Zerar p/ Modo Real</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Configurações & URLs de Webhooks"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Configurações</span>
          </button>

        </div>
      </div>
    </header>
  );
}
