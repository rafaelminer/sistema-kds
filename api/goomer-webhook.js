// Serverless Endpoint (Vercel API Route) for Goomer Webhook integration
import { createClient } from '@supabase/supabase-js';

const GOOMER_SECRET_TOKEN = process.env.VITE_GOOMER_TOKEN || "16817885-c866-495b-8d27-23e873bb56f8";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Token authentication check (if sent by Goomer headers or query param)
  const incomingToken = req.headers['x-goomer-token'] || req.headers['authorization'] || req.query.token;
  if (incomingToken && incomingToken !== GOOMER_SECRET_TOKEN && !incomingToken.includes(GOOMER_SECRET_TOKEN)) {
    console.warn('⚠️ Token Goomer não bateu:', incomingToken);
    // Proceeding to parse payload while logging
  }

  try {
    const body = req.body || {};
    
    // Goomer payload normalization
    const orderData = body.order || body.data || body;

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Extract items from Goomer structure
    const rawItems = orderData.items || orderData.products || orderData.cart || [];
    const normalizedItems = rawItems.map((item, index) => ({
      id: item.id || String(index + 1),
      name: item.name || item.title || item.product_name || 'Item Goomer',
      quantity: item.quantity || item.amount || 1,
      obs: item.obs || item.notes || item.observation || (item.options ? item.options.map(o => o.name).join(', ') : ''),
      sector: item.category_name || item.sector || 'Cozinha'
    }));

    if (normalizedItems.length === 0 && orderData.name) {
      normalizedItems.push({
        id: '1',
        name: orderData.name,
        quantity: orderData.quantity || 1,
        obs: orderData.obs || '',
        sector: 'Cozinha'
      });
    }

    const goomerOrderIdStr = orderData.code || orderData.display_id || orderData.id || Math.floor(10000 + Math.random() * 90000);
    const tableOrClientName = orderData.table ? `Mesa ${orderData.table}` : (orderData.customer?.name || orderData.client_name || 'Mesa Balcão');

    const newKdsOrder = {
      id: `gmr-${orderData.id || Date.now()}`,
      channel: 'GOOMER',
      goomer_id: `G-${goomerOrderIdStr}`,
      ifood_id: null,
      order_type: orderData.delivery_type === 'DELIVERY' ? 'Delivery' : (orderData.table ? 'Mesa' : 'Balcão'),
      table_or_client: tableOrClientName,
      customer_name: orderData.customer?.name || orderData.client_name || 'Cliente Goomer',
      sector: normalizedItems[0]?.sector || 'Cozinha',
      status: 'NOVO',
      items: normalizedItems,
      total_price: orderData.total || orderData.total_price || 0,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([newKdsOrder])
        .select()
        .single();

      if (error) {
        console.error('Erro ao gravar pedido Goomer no Supabase:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        order_id: data.id,
        message: 'Pedido Goomer integrado ao KDS com sucesso!'
      });
    }

    return res.status(200).json({
      success: true,
      order: newKdsOrder,
      message: 'Pedido Goomer recebido com sucesso no webhook!'
    });

  } catch (err) {
    console.error('Erro ao processar Webhook Goomer:', err);
    return res.status(500).json({ error: 'Erro interno ao processar webhook do Goomer.' });
  }
}
