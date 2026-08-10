// Service for fetching orders directly from Goomer Integration API via Serverless Proxy
export async function fetchGoomerOrders(apiToken) {
  const token = apiToken || "9e3dac23-eabb-4861-8b43-c5fdde9caea5";

  // First try the Vercel Serverless proxy (bypasses browser CORS completely)
  try {
    const proxyRes = await fetch(`/api/fetch-goomer?token=${encodeURIComponent(token)}`);
    if (proxyRes && proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && data.orders) {
        return data.orders;
      }
    }
  } catch (err) {
    // Fallback if running pure local client
  }

  // Direct client fallback
  try {
    const res = await fetch('https://partner-api.goomer.app/v1/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': token,
        'Authorization': `Bearer ${token}`
      }
    });

    if (res && res.ok) {
      const data = await res.json();
      const rawOrders = Array.isArray(data) ? data : (data.orders || data.data || []);
      
      return rawOrders.map(order => ({
        id: `gmr-${order.id}`,
        channel: 'GOOMER',
        goomer_id: `G-${order.code || order.display_id || order.id}`,
        order_type: order.delivery_type === 'DELIVERY' ? 'Delivery' : (order.table ? 'Mesa' : 'Balcão'),
        table_or_client: order.table ? `Mesa ${order.table}` : (order.customer?.name || 'Mesa Balcão'),
        customer_name: order.customer?.name || 'Cliente Goomer',
        sector: order.items?.[0]?.category_name || 'Cozinha',
        status: order.status === 'IN_PREPARATION' ? 'EM PREPARO' : 'NOVO',
        items: (order.items || []).map((item, idx) => ({
          id: item.id || String(idx + 1),
          name: item.name || item.title || 'Item Goomer',
          quantity: item.quantity || 1,
          obs: item.obs || item.observation || '',
          sector: item.category_name || 'Cozinha'
        })),
        total_price: order.total || 0,
        created_at: order.created_at || new Date().toISOString()
      }));
    }
  } catch (err) {
    // CORS or network error caught safely
  }

  return [];
}
