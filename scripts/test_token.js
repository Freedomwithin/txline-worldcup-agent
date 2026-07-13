const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔑 Testing API Token in your project...');
  
  // Load JWT and API token
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
  
  console.log('✅ JWT loaded');
  console.log('✅ API Token loaded');
  
  const endpoints = [
    '/fixtures',
    '/fixtures/snapshot',
    '/fixtures?limit=10',
    '/scores',
    '/scores/snapshot',
    '/odds',
    '/odds/snapshot'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('\n📡 Testing: ' + endpoint);
      const response = await axios.get(
        'https://txline-dev.txodds.com/api' + endpoint,
        {
          headers: {
            'Authorization': 'Bearer ' + jwt,
            'X-Api-Token': apiToken
          }
        }
      );
      console.log('✅ ' + endpoint + ' working!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2).slice(0, 300) + '...');
    } catch (error) {
      console.log('❌ ' + endpoint + ' failed:', error.response?.status, error.response?.data || error.message);
    }
  }
}

main().catch(console.error);
