import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { tripCode, token } = req.body;
    
    if (!tripCode || !token) {
      return res.status(400).json({ error: 'Missing tripCode or token' });
    }
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    console.log(`Processing tripCode: ${tripCode}`);
    
    const response = await fetch('https://fe-nhanh-api.ghn.vn/api/lastmile/v2/trip/trip-detail', {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'origin': 'https://nhanh.ghn.vn',
        'referer': 'https://nhanh.ghn.vn/',
        'user-agent': randomUA
      },
      body: JSON.stringify({ trip_code: tripCode })
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.log(`Error ${response.status}: ${responseText.substring(0, 200)}`);
      return res.status(response.status).json({ 
        error: `API call failed with status ${response.status}`,
        details: responseText.substring(0, 500),
        tripCode: tripCode
      });
    }
    
    const data = JSON.parse(responseText);
    console.log(`Success for tripCode: ${tripCode}`);
    
    res.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
