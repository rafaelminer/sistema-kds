import { createClient } from '@supabase/supabase-js';

// Initial mock orders representing Goomer AND iFood orders
export const INITIAL_MOCK_ORDERS = [
  {
    id: 'ifd-9041',
    ifood_id: 'iFood #1942',
    channel: 'IFOOD',
    order_type: 'Delivery',
    table_or_client: 'Pedido iFood #1942',
    customer_name: 'Lucas Mendes',
    sector: 'Cozinha',
    status: 'NOVO',
    items: [
      { id: '10', name: 'Yakisoba Misto Frango e Carne (G)', quantity: 1, obs: 'Pouco molho, entregar rápido', sector: 'Cozinha' },
      { id: '11', name: 'Gyoza Suíno Vazio (6 un)', quantity: 1, obs: 'Molho agrodolce à parte', sector: 'Cozinha' },
      { id: '12', name: 'Guaraná Antarctica 350ml', quantity: 2, obs: 'Gelada', sector: 'Bar' }
    ],
    total_price: 84.90,
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() // 3 mins ago
  },
  {
    id: 'gmr-1001',
    goomer_id: 'G-84920',
    channel: 'GOOMER',
    order_type: 'Mesa',
    table_or_client: 'Mesa 04 (Goomer)',
    customer_name: 'Carlos Oliveira',
    sector: 'Sushibar',
    status: 'NOVO',
    items: [
      { id: '1', name: 'Temaki Salmão Completo', quantity: 2, obs: 'Sem cebolinha, extra cream cheese', sector: 'Sushibar' },
      { id: '2', name: 'Hot Roll Crispy (10 un)', quantity: 1, obs: '', sector: 'Sushibar' },
      { id: '3', name: 'Coca-Cola Zero 350ml', quantity: 2, obs: 'Com gelo e limão', sector: 'Bar' }
    ],
    total_price: 89.90,
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  },
  {
    id: 'ifd-9040',
    ifood_id: 'iFood #1941',
    channel: 'IFOOD',
    order_type: 'Delivery',
    table_or_client: 'Pedido iFood #1941',
    customer_name: 'Juliana Paes',
    sector: 'Sushibar',
    status: 'EM PREPARO',
    items: [
      { id: '13', name: 'Combinado Especial Chef (30 Peças)', quantity: 1, obs: 'Sem Wasabi, Extra Gergelim', sector: 'Sushibar' },
      { id: '14', name: 'Shimeji na Manteiga 200g', quantity: 1, obs: 'Bem passado', sector: 'Cozinha' }
    ],
    total_price: 135.00,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 mins ago (Warning)
  },
  {
    id: 'gmr-1003',
    goomer_id: 'G-84922',
    channel: 'GOOMER',
    order_type: 'Mesa',
    table_or_client: 'Mesa 12 (Goomer)',
    customer_name: 'Roberto Santos',
    sector: 'Bar',
    status: 'PRONTO',
    items: [
      { id: '6', name: 'Caipirinha de Sake com Morango', quantity: 2, obs: 'Açúcar moderado', sector: 'Bar' },
      { id: '7', name: 'Petit Gateau de Doce de Leite', quantity: 1, obs: 'Sorvete de creme', sector: 'Sobremesas' }
    ],
    total_price: 58.00,
    created_at: new Date(Date.now() - 24 * 60 * 1000).toISOString() // 24 mins ago (Urgent)
  }
];

const getStorageItem = (key, fallback = '') => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key) || fallback;
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return fallback;
};

const setStorageItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

class KdsStorageService {
  constructor() {
    this.supabase = null;
    this.useSupabase = false;
    this.initSupabase();
  }

  initSupabase() {
    const url = getStorageItem('kds_supabase_url') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '') || '';
    const key = getStorageItem('kds_supabase_key') || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '') || '';

    const safeUrl = typeof url === 'string' ? url.trim() : '';
    const safeKey = typeof key === 'string' ? key.trim() : '';

    if (safeUrl && safeKey && safeUrl.startsWith('http')) {
      try {
        this.supabase = createClient(safeUrl, safeKey);
        this.useSupabase = true;
        console.log('⚡ Supabase Multicanal Conectado com sucesso!');
      } catch (err) {
        console.warn('Erro ao inicializar Supabase, usando LocalStorage:', err);
        this.useSupabase = false;
      }
    } else {
      this.useSupabase = false;
    }
  }

  getConfig() {
    return {
      supabaseUrl: getStorageItem('kds_supabase_url', ''),
      supabaseKey: getStorageItem('kds_supabase_key', ''),
      goomerToken: getStorageItem('kds_goomer_token', '16817885-c866-495b-8d27-23e873bb56f8'),
      ifoodToken: getStorageItem('kds_ifood_token', ''),
      soundEnabled: getStorageItem('kds_sound', 'true') !== 'false',
      warningMin: parseInt(getStorageItem('kds_warn_min', '10'), 10),
      urgentMin: parseInt(getStorageItem('kds_urg_min', '20'), 10)
    };
  }

  saveConfig(config) {
    if (config.supabaseUrl !== undefined) setStorageItem('kds_supabase_url', config.supabaseUrl);
    if (config.supabaseKey !== undefined) setStorageItem('kds_supabase_key', config.supabaseKey);
    if (config.goomerToken !== undefined) setStorageItem('kds_goomer_token', config.goomerToken);
    if (config.ifoodToken !== undefined) setStorageItem('kds_ifood_token', config.ifoodToken);
    if (config.soundEnabled !== undefined) setStorageItem('kds_sound', config.soundEnabled ? 'true' : 'false');
    if (config.warningMin) setStorageItem('kds_warn_min', config.warningMin.toString());
    if (config.urgentMin) setStorageItem('kds_urg_min', config.urgentMin.toString());
    this.initSupabase();
  }

  async getOrders() {
    if (this.useSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Falha na consulta Supabase, caindo para LocalStorage:', e);
      }
    }

    const stored = getStorageItem('kds_orders', null);
    if (!stored) {
      setStorageItem('kds_orders', JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch (err) {
      return [];
    }
  }

  async addOrder(newOrder) {
    const isIfood = newOrder.channel === 'IFOOD';
    const preparedOrder = {
      id: newOrder.id || (isIfood ? `ifd-${Date.now().toString().slice(-5)}` : `gmr-${Date.now().toString().slice(-5)}`),
      channel: newOrder.channel || 'GOOMER',
      goomer_id: isIfood ? null : (newOrder.goomer_id || `G-${Math.floor(10000 + Math.random() * 90000)}`),
      ifood_id: isIfood ? (newOrder.ifood_id || `iFood #${Math.floor(1000 + Math.random() * 9000)}`) : null,
      order_type: newOrder.order_type || (isIfood ? 'Delivery' : 'Mesa'),
      table_or_client: newOrder.table_or_client || (isIfood ? 'Pedido iFood' : 'Mesa Balcão'),
      customer_name: newOrder.customer_name || 'Cliente',
      sector: newOrder.sector || 'Cozinha',
      status: 'NOVO',
      items: newOrder.items || [],
      total_price: newOrder.total_price || 0,
      created_at: newOrder.created_at || new Date().toISOString()
    };

    if (this.useSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('pedidos')
          .insert([preparedOrder])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Erro ao salvar no Supabase:', e);
      }
    }

    const orders = await this.getOrders();
    const updated = [preparedOrder, ...orders];
    setStorageItem('kds_orders', JSON.stringify(updated));
    return preparedOrder;
  }

  async updateStatus(orderId, newStatus) {
    if (this.useSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('pedidos')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error('Erro ao atualizar status no Supabase:', e);
      }
    }

    const orders = await this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setStorageItem('kds_orders', JSON.stringify(updated));
    return updated.find(o => o.id === orderId);
  }

  async resetDemoOrders() {
    if (this.useSupabase && this.supabase) {
      try {
        await this.supabase.from('pedidos').delete().neq('id', '0');
      } catch (e) {
        console.error('Erro ao limpar Supabase:', e);
      }
    }
    setStorageItem('kds_orders', JSON.stringify(INITIAL_MOCK_ORDERS));
    return INITIAL_MOCK_ORDERS;
  }

  subscribeRealtime(onInsert, onUpdate, onDelete) {
    if (this.useSupabase && this.supabase) {
      const channel = this.supabase
        .channel('kds_realtime_orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
          if (onInsert) onInsert(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, payload => {
          if (onUpdate) onUpdate(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pedidos' }, payload => {
          if (onDelete) onDelete(payload.old);
        })
        .subscribe();

      return () => {
        this.supabase.removeChannel(channel);
      };
    }
    return () => {};
  }
}

export const kdsStorage = new KdsStorageService();
