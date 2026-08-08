// Serverless Endpoint (Vercel API Route) for iFood Merchant Webhook integration
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const body = req.body || {};
    
    // iFood webhook events format (array of events or single event body)
    const events = Array.isArray(body) ? body : [body];

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://vtlusakhkxpmwqsbhojj.supabase.co";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_H2BsYsa7HyJmzW70rGeYkw_ACoArvxQ";

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    const processedOrders = [];

    for (const event of events) {
      const eventCode = event.code || event.fullCode || 'PLACED'; // PLACED, CONFIRMED, READY_FOR_PICKUP, CONCLUDED, CANCELLED
      const orderData = event.order || event.payload || event;

      // Extract iFood display ID (e.g. #1942)
      const displayId = orderData.displayId || orderData.shortCode || orderData.id || Math.floor(1000 + Math.random() * 9000);
      const ifoodIdStr = `iFood #${displayId}`;
      const internalId = `ifd-${orderData.id || Date.now()}`;

      // Extract items
      const rawItems = orderData.items || [];
      const normalizedItems = rawItems.map((item, index) => ({
        id: item.id || String(index + 1),
        name: item.name || item.title || 'Prato iFood',
        quantity: item.quantity || 1,
        obs: item.observations || item.notes || (item.options ? item.options.map(o => o.name).join(', ') : ''),
        sector: item.categoryName || 'Cozinha'
      }));

      // Fallback item if array empty
      if (normalizedItems.length === 0) {
        normalizedItems.push({
          id: '1',
          name: orderData.description || 'Pedido iFood',
          quantity: 1,
          obs: orderData.observations || '',
          sector: 'Cozinha'
        });
      }

      // Map iFood status to KDS status
      let kdsStatus = 'NOVO';
      if (eventCode === 'CONFIRMED') kdsStatus = 'EM PREPARO';
      else if (eventCode === 'READY_FOR_PICKUP') kdsStatus = 'PRONTO';
      else if (eventCode === 'CONCLUDED' || eventCode === 'DISPATCHED') kdsStatus = 'CONCLUIDO';
      else if (eventCode === 'CANCELLED') kdsStatus = 'CANCELADO';

      const newKdsOrder = {
        id: internalId,
        channel: 'IFOOD',
        ifood_id: ifoodIdStr,
        order_type: orderData.orderType === 'TAKEOUT' ? 'Retirada' : 'Delivery',
        table_or_client: `Pedido ${ifoodIdStr}`,
        customer_name: orderData.customer?.name || 'Cliente iFood',
        sector: normalizedItems[0]?.sector || 'Cozinha',
        status: kdsStatus,
        items: normalizedItems,
        total_price: (orderData.total || orderData.orderAmount || 0) / 100 || orderData.total || 0,
        created_at: new Date().toISOString()
      };

      if (supabase) {
        // Upsert into Supabase (insert or update status)
        await supabase.from('pedidos').upsert([newKdsOrder], { onConflict: 'id' });
      }

      processedOrders.push(newKdsOrder);
    }

    return res.status(200).json({
      success: true,
      processed_count: processedOrders.length,
      orders: processedOrders,
      message: 'Eventos iFood integrados ao KDS com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao processar Webhook iFood:', err);
    return res.status(500).json({ error: 'Erro interno ao processar webhook do iFood.' });
  }
}
