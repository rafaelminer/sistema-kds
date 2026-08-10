import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import OrderCard from './components/OrderCard';
import AllDayPrepSummary from './components/AllDayPrepSummary';
import GoomerSimulatorModal from './components/GoomerSimulatorModal';
import SettingsModal from './components/SettingsModal';
import { kdsStorage } from './services/supabase';
import { soundManager } from './services/sound';
import { Search, Inbox } from 'lucide-react';

import { fetchGoomerOrders } from './services/goomerApi';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL'); // ALL, GOOMER, IFOOD
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // ACTIVE, NOVO, EM PREPARO, PRONTO, CONCLUIDO
  const [searchTerm, setSearchTerm] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioUserPermission, setAudioUserPermission] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const config = kdsStorage.getConfig();

  const loadOrders = useCallback(async () => {
    try {
      // 1. Puxa novos pedidos da Goomer via proxy e grava no Supabase Cloud
      if (config.goomerToken) {
        await fetchGoomerOrders(config.goomerToken);
      }

      // 2. Carrega todos os pedidos gravados no Supabase (Goomer + iFood)
      const data = await kdsStorage.getOrders();
      setOrders(data);
      setIsCloudConnected(kdsStorage.useSupabase);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [config.goomerToken]);

  useEffect(() => {
    loadOrders();

    // Polling interval every 15 seconds to check new Goomer orders
    const interval = setInterval(loadOrders, 15000);

    const unsubscribe = kdsStorage.subscribeRealtime(
      (newOrder) => {
        setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
        if (audioEnabled) {
          soundManager.playNewOrderSound();
        }
      },
      (updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      },
      (deletedOrder) => {
        setOrders(prev => prev.filter(o => o.id !== deletedOrder.id));
      }
    );

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [loadOrders, audioEnabled]);

  const handleEnableAudioInteractively = () => {
    soundManager.init();
    setAudioUserPermission(true);
    if (audioEnabled) {
      soundManager.playNewOrderSound();
    }
  };

  const handleAddOrder = async (newOrderPayload) => {
    const created = await kdsStorage.addOrder(newOrderPayload);
    setOrders(prev => [created, ...prev.filter(o => o.id !== created.id)]);
    if (audioEnabled) {
      soundManager.playNewOrderSound();
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'PRONTO' && audioEnabled) {
      soundManager.playOrderReadySound();
    }
    const updated = await kdsStorage.updateStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleClearDemoAndStartReal = async () => {
    if (window.confirm('Deseja limpar todos os pedidos fictícios de demonstração e deixar a tela pronta para receber SOMENTE pedidos reais?')) {
      localStorage.setItem('kds_orders', JSON.stringify([]));
      setOrders([]);
      if (kdsStorage.useSupabase && kdsStorage.supabase) {
        try {
          await kdsStorage.supabase.from('pedidos').delete().neq('id', '0');
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Deseja restaurar os pedidos de exemplo do Goomer e iFood?')) {
      const reseted = await kdsStorage.resetDemoOrders();
      setOrders(reseted);
    }
  };

  // Filtering orders
  const filteredOrders = orders.filter(order => {
    // Channel filter (ALL, GOOMER, IFOOD)
    if (selectedChannel !== 'ALL') {
      const orderChannel = order.channel || (order.ifood_id ? 'IFOOD' : 'GOOMER');
      if (orderChannel !== selectedChannel) return false;
    }

    // Sector filter (Cozinha vs Copa)
    if (selectedSector !== 'ALL') {
      const hasSectorItem = order.items && order.items.some(i => {
        const itemSec = (i.sector || order.sector || '').toLowerCase();
        const filterSec = selectedSector.toLowerCase();
        if (filterSec === 'cozinha') {
          return itemSec.includes('cozinha') || itemSec.includes('hot') || itemSec.includes('sushi') || itemSec === '';
        }
        if (filterSec === 'copa') {
          return itemSec.includes('copa') || itemSec.includes('bar') || itemSec.includes('bebida') || itemSec.includes('suco') || itemSec.includes('agua');
        }
        return itemSec.includes(filterSec);
      });
      if (!hasSectorItem) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE' && (order.status === 'CONCLUIDO' || order.status === 'CANCELADO')) return false;
    if (statusFilter !== 'ACTIVE' && order.status !== statusFilter) return false;

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchClient = order.table_or_client?.toLowerCase().includes(term);
      const matchCustomer = order.customer_name?.toLowerCase().includes(term);
      const matchGoomer = order.goomer_id?.toLowerCase().includes(term);
      const matchIfood = order.ifood_id?.toLowerCase().includes(term);
      const matchItem = order.items?.some(i => i.name.toLowerCase().includes(term));
      if (!matchClient && !matchCustomer && !matchGoomer && !matchIfood && !matchItem) return false;
    }

    return true;
  });

  const activeCount = orders.filter(o => o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO').length;
  const newCount = orders.filter(o => o.status === 'NOVO').length;
  const inPrepCount = orders.filter(o => o.status === 'EM PREPARO').length;
  const readyCount = orders.filter(o => o.status === 'PRONTO').length;
  const completedCount = orders.filter(o => o.status === 'CONCLUIDO').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      <Header
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCloudConnected={isCloudConnected}
        ordersCount={activeCount}
        onResetDemo={handleResetDemo}
        onClearDemo={handleClearDemoAndStartReal}
      />

      {!audioUserPermission && (
        <div 
          onClick={handleEnableAudioInteractively}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 px-4 py-2 text-center text-xs font-black cursor-pointer shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
        >
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>CLIQUE AQUI PARA ATIVAR OS ALERTAS SONOROS DA COZINHA (GOOMER & IFOOD) 🔔</span>
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
          
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🔥 Em Aberto</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono">{activeCount}</span>
            </button>

            <button
              onClick={() => setStatusFilter('NOVO')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'NOVO'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/70 text-cyan-400 hover:bg-slate-800'
              }`}
            >
              <span>⚡ Novos</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono">{newCount}</span>
            </button>

            <button
              onClick={() => setStatusFilter('EM PREPARO')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'EM PREPARO'
                  ? 'bg-amber-600 text-white font-black shadow-lg shadow-amber-600/20'
                  : 'bg-slate-800/70 text-amber-300 hover:bg-slate-800'
              }`}
            >
              <span>🍳 Em Preparo</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono">{inPrepCount}</span>
            </button>

            <button
              onClick={() => setStatusFilter('PRONTO')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'PRONTO'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/70 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <span>✅ Prontos</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono">{readyCount}</span>
            </button>

            <button
              onClick={() => setStatusFilter('CONCLUIDO')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'CONCLUIDO'
                  ? 'bg-slate-700 text-white font-black'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>📦 Histórico</span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/40 text-[11px] font-mono">{completedCount}</span>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar mesa, iFood #, cliente..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
            />
        </div>

        {/* All-Day Prep Batch Summary */}
        <AllDayPrepSummary orders={orders} />

        {/* Orders Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs font-bold">Carregando pedidos multicanal...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Nenhum pedido pendente</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Aguardando entrada de novos pedidos reais da Goomer ou iFood...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                warningMin={config.warningMin}
                urgentMin={config.urgentMin}
              />
            ))}
          </div>
        )}

      </main>

      <GoomerSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendSimulatedOrder={handleAddOrder}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSuccess={loadOrders}
      />

    </div>
  );
}
