// Vercel Serverless Function to Proxy Goomer API calls & sync with Supabase Cloud
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.query.token || process.env.VITE_GOOMER_TOKEN || "9e3dac23-eabb-4861-8b43-c5fdde9caea5";
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://vtlusakhkxpmwqsbhojj.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_H2BsYsa7HyJmzW70rGeYkw_ACoArvxQ";

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  const urlsToTry = [
    `https://partner-api.goomer.app/v1/events/polling`,
    `https://partner-api.goomer.app/v1/orders`,
    `https://partner-api.goomer.app/opendelivery/v1/events/polling`,
    `https://partner-api.goomer.app/opendelivery/v1/orders`,
    `https://api.goomer.app/v1/events/polling`,
    `https://api.goomer.app/v1/orders`,
    `https://api.goomer.com.br/v1/events/polling`,
    `https://api.goomer.com.br/v1/orders`
  ];

  const headerCombos = [
    { 'Content-Type': 'application/json', 'x-api-token': token, 'Authorization': `Bearer ${token}` },
    { 'Content-Type': 'application/json', 'x-goomer-token': token },
    { 'Content-Type': 'application/json', 'x-api-key': token },
    { 'Content-Type': 'application/json', 'Authorization': token }
  ];

  let fetchedOrders = [];
  let debugLog = [];

  for (const url of urlsToTry) {
    for (const headers of headerCombos) {
      try {
        const response = await fetch(url, { method: 'GET', headers });
        debugLog.push({ url, status: response.status });
        if (response.ok) {
          const data = await response.json();
          const rawList = Array.isArray(data) ? data : (data.orders || data.data || data.results || data.events || []);
          if (rawList && rawList.length > 0) {
            // Extract order payloads from events or direct orders
            fetchedOrders = rawList.map(item => item.order || item.payload || item);
            break;
          }
        }
      } catch (e) {
        // continue
      }
    }
    if (fetchedOrders.length > 0) break;
  }

  const normalized = fetchedOrders.map(order => ({
    id: `gmr-${order.id || Date.now()}`,
    channel: 'GOOMER',
    goomer_id: `G-${order.code || order.display_id || order.id || Math.floor(1000 + Math.random()*9000)}`,
    order_type: order.delivery_type === 'DELIVERY' ? 'Delivery' : (order.table ? 'Mesa' : 'Balcão'),
    table_or_client: order.table ? `Mesa ${order.table}` : (order.customer?.name || order.client_name || 'Mesa Balcão'),
    customer_name: order.customer?.name || order.client_name || 'Cliente Goomer',
    sector: order.items?.[0]?.category_name || order.items?.[0]?.sector || 'Cozinha',
    status: order.status === 'FINISHED' || order.status === 'DELIVERED' ? 'CONCLUIDO' : (order.status === 'IN_PREPARATION' ? 'EM PREPARO' : 'NOVO'),
    items: (order.items || order.products || []).map((item, idx) => ({
      id: item.id || String(idx + 1),
      name: item.name || item.title || 'Item Goomer',
      quantity: item.quantity || 1,
      obs: item.obs || item.observation || '',
      sector: item.category_name || item.sector || 'Cozinha'
    })),
    total_price: order.total || order.total_price || 0,
    created_at: order.created_at || new Date().toISOString()
  }));

  // Auto-sync into Supabase database if orders found
  if (supabase && normalized.length > 0) {
    try {
      await supabase.from('pedidos').upsert(normalized, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro ao sincronizar pedidos buscados com Supabase:', err);
    }
  }

  return res.status(200).json({ success: true, count: normalized.length, orders: normalized, debug: debugLog });
}
