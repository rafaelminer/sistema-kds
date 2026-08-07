// Vercel Serverless Function to Proxy Goomer API calls without browser CORS issues
export default async function handler(req, res) {
  // Set CORS headers so frontend can read
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

  const token = req.query.token || process.env.VITE_GOOMER_TOKEN || "16817885-c866-495b-8d27-23e873bb56f8";

  const endpointsToTry = [
    'https://partner-api.goomer.app/v1/orders',
    'https://api.goomer.app/v1/orders?status=PENDING,IN_PREPARATION',
    'https://api.goomer.app/v1/orders',
    'https://api.goomer.com.br/v1/orders'
  ];

  let fetchedOrders = [];

  for (const url of endpointsToTry) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': token,
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data.orders || data.data || []);
        if (rawList && rawList.length > 0) {
          fetchedOrders = rawList;
          break;
        }
      }
    } catch (e) {
      // Continue trying next endpoint
    }
  }

  const normalized = fetchedOrders.map(order => ({
    id: `gmr-${order.id || Date.now()}`,
    channel: 'GOOMER',
    goomer_id: `G-${order.code || order.display_id || order.id || Math.floor(1000 + Math.random()*9000)}`,
    order_type: order.delivery_type === 'DELIVERY' ? 'Delivery' : (order.table ? 'Mesa' : 'Balcão'),
    table_or_client: order.table ? `Mesa ${order.table}` : (order.customer?.name || order.client_name || 'Mesa Balcão'),
    customer_name: order.customer?.name || order.client_name || 'Cliente Goomer',
    sector: order.items?.[0]?.category_name || 'Cozinha',
    status: order.status === 'IN_PREPARATION' ? 'EM PREPARO' : 'NOVO',
    items: (order.items || order.products || []).map((item, idx) => ({
      id: item.id || String(idx + 1),
      name: item.name || item.title || 'Item Goomer',
      quantity: item.quantity || 1,
      obs: item.obs || item.observation || '',
      sector: item.category_name || 'Cozinha'
    })),
    total_price: order.total || order.total_price || 0,
    created_at: order.created_at || new Date().toISOString()
  }));

  return res.status(200).json({ success: true, count: normalized.length, orders: normalized });
}
