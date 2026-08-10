// Serverless Diagnostic Tool for Goomer API Connection
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = req.query.token || process.env.VITE_GOOMER_TOKEN || "9e3dac23-eabb-4861-8b43-c5fdde9caea5";

  const targetEndpoints = [
    'https://partner-api.goomer.app/v1/orders',
    'https://partner-api.goomer.app/v1/events/polling',
    'https://partner-api.goomer.app/opendelivery/v1/orders',
    'https://partner-api.goomer.app/opendelivery/v1/events/polling',
    'https://api.goomer.app/v1/orders',
    'https://api.goomer.app/v1/events/polling',
    'https://api.goomer.com.br/v1/orders',
    'https://api.goomer.com.br/v1/events/polling'
  ];

  const headerVariants = [
    { name: 'x-api-token', headers: { 'Content-Type': 'application/json', 'x-api-token': token } },
    { name: 'Bearer Token', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } },
    { name: 'x-goomer-token', headers: { 'Content-Type': 'application/json', 'x-goomer-token': token } },
    { name: 'x-api-key', headers: { 'Content-Type': 'application/json', 'x-api-key': token } }
  ];

  const results = [];

  for (const url of targetEndpoints) {
    for (const variant of headerVariants) {
      try {
        const start = Date.now();
        const response = await fetch(url, { method: 'GET', headers: variant.headers });
        const timeMs = Date.now() - start;
        let responseBodySnippet = '';
        try {
          const text = await response.text();
          responseBodySnippet = text.slice(0, 300);
        } catch (e) {
          responseBodySnippet = 'Could not parse text';
        }

        results.push({
          url,
          auth_variant: variant.name,
          http_status: response.status,
          status_text: response.statusText,
          time_ms: timeMs,
          snippet: responseBodySnippet
        });
      } catch (err) {
        results.push({
          url,
          auth_variant: variant.name,
          error: err.message
        });
      }
    }
  }

  return res.status(200).json({
    diagnostics: 'Goomer API Integration Checker',
    token_tested: `${token.slice(0, 8)}...`,
    timestamp: new Date().toISOString(),
    results
  });
}
