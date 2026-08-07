import React, { useState } from 'react';
import { X, Send, Sparkles, Plus, Trash2, ShoppingBag, Utensils, AlertCircle } from 'lucide-react';

export default function GoomerSimulatorModal({ isOpen, onClose, onSendSimulatedOrder }) {
  if (!isOpen) return null;

  const [channel, setChannel] = useState('GOOMER'); // 'GOOMER' | 'IFOOD'
  const [orderType, setOrderType] = useState('Delivery');
  const [tableOrClient, setTableOrClient] = useState('Pedido iFood #1950');
  const [customerName, setCustomerName] = useState('Mariana Costa');
  const [items, setItems] = useState([
    { id: '1', name: 'Combinado Chef (20 peças)', quantity: 1, obs: 'Sem Wasabi', sector: 'Sushibar' },
    { id: '2', name: 'Shimeji na Manteiga', quantity: 1, obs: 'Servir bem quente', sector: 'Cozinha' },
    { id: '3', name: 'Suco Natural de Laranja 500ml', quantity: 2, obs: 'Com gelo', sector: 'Bar' }
  ]);

  const presetDishes = [
    { name: 'Temaki Salmão Grelhado', sector: 'Sushibar', obs: 'Sem gergelim' },
    { name: 'Yakisoba Misto (Família)', sector: 'Cozinha', obs: 'Molho suave' },
    { name: 'Hot Roll Especial (10un)', sector: 'Sushibar', obs: '' },
    { name: 'Ceviche Tradicional', sector: 'Sushibar', obs: 'Pimenta moderada' },
    { name: 'Sprite Lata 350ml', sector: 'Bar', obs: 'Bem gelada' },
    { name: 'Petit Gateau Chocolate', sector: 'Sobremesas', obs: 'Com sorvete' }
  ];

  const handleChannelSwitch = (newChannel) => {
    setChannel(newChannel);
    if (newChannel === 'IFOOD') {
      setOrderType('Delivery');
      setTableOrClient(`Pedido iFood #${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setOrderType('Mesa');
      setTableOrClient(`Mesa ${Math.floor(1 + Math.random() * 20)}`);
    }
  };

  const handleAddItem = (dish) => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: dish ? dish.name : 'Novo Item',
        quantity: 1,
        obs: dish ? dish.obs : '',
        sector: dish ? dish.sector : 'Cozinha'
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    const isIfood = channel === 'IFOOD';
    const payload = {
      id: isIfood ? `ifd-${Date.now().toString().slice(-6)}` : `gmr-${Date.now().toString().slice(-6)}`,
      channel: channel,
      goomer_id: isIfood ? null : `G-${Math.floor(10000 + Math.random() * 90000)}`,
      ifood_id: isIfood ? `iFood #${Math.floor(1000 + Math.random() * 9000)}` : null,
      order_type: orderType,
      table_or_client: tableOrClient,
      customer_name: customerName,
      sector: items[0]?.sector || 'Cozinha',
      status: 'NOVO',
      items: items,
      total_price: items.length * 32.00,
      created_at: new Date().toISOString()
    };

    onSendSimulatedOrder(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">Simulador de Pedidos Multicanal</h2>
              <p className="text-xs text-slate-400">Simule a entrada de pedidos em tempo real do Goomer ou do iFood</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Channel Selector Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Selecione o Canal do Pedido:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChannelSwitch('GOOMER')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                  channel === 'GOOMER'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <span>🍊 GOOMER (Mesa / Delivery)</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('IFOOD')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
                  channel === 'IFOOD'
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <span>🔴 IFOOD (Merchant API)</span>
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Pedido</label>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Delivery">Delivery</option>
                <option value="Mesa">Mesa / Comanda</option>
                <option value="Balcao">Retirada no Balcão</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Mesa / Ref / iFood ID</label>
              <input 
                type="text" 
                value={tableOrClient}
                onChange={(e) => setTableOrClient(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Cliente</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Dishes Suggestions */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Pratos Rápidos:</label>
            <div className="flex flex-wrap gap-1.5">
              {presetDishes.map((dish, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddItem(dish)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  {dish.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Config Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Itens do Pedido ({items.length})</span>
              <button 
                type="button" 
                onClick={() => handleAddItem(null)} 
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Item Personalizado
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-2">
                  <input 
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center font-black text-amber-400"
                  />
                </div>

                <div className="sm:col-span-4">
                  <input 
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select 
                    value={item.sector}
                    onChange={(e) => handleUpdateItem(item.id, 'sector', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300"
                  >
                    <option value="Cozinha">🍳 Cozinha Hot</option>
                    <option value="Sushibar">🍣 Sushibar</option>
                    <option value="Bar">🍹 Bar & Drinks</option>
                    <option value="Sobremesas">🍰 Sobremesas</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input 
                    type="text"
                    value={item.obs}
                    onChange={(e) => handleUpdateItem(item.id, 'obs', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300"
                    placeholder="Obs (ex: sem sal)"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            O pedido será processado com aviso sonoro instantâneo.
          </p>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg text-xs font-black text-white shadow-lg flex items-center gap-2 ${
                channel === 'IFOOD' 
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/30'
              }`}
            >
              <Send className="w-4 h-4" /> Disparar Pedido {channel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
