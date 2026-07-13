const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔑 Testing all working endpoints...');
  
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
  
  console.log('✅ JWT loaded');
  console.log('✅ API Token loaded');
  
  // Try all possible endpoints
  const endpoints = [
    { path: '/fixtures/snapshot', name: 'Fixtures Snapshot' },
    { path: '/fixtures/snapshot?limit=5', name: 'Fixtures Snapshot (limit 5)' },
    { path: '/scores/snapshot', name: 'Scores Snapshot' },
    { path: '/scores/snapshot?fixtureId=18143850', name: 'Scores for fixture' },
    { path: '/odds/snapshot', name: 'Odds Snapshot' },
    { path: '/odds/snapshot?fixtureId=18143850', name: 'Odds for fixture' },
    { path: '/scores/historical/18143850', name: 'Historical Scores' },
  ];
  
  for (const ep of endpoints) {
    try {
      console.log('\n📡 Testing: ' + ep.path);
      const response = await axios.get(
        'https://txline-dev.txodds.com/api' + ep.path,
        {
          headers: {
            'Authorization': 'Bearer ' + jwt,
            'X-Api-Token': apiToken,
            'Accept': 'application/json'
          }
        }
      );
      console.log('✅ ' + ep.name + ' working!');
      if (Array.isArray(response.data)) {
        console.log('📊 Count: ' + response.data.length);
      }
      console.log('📊 First item:', JSON.stringify(response.data[0] || response.data, null, 2).slice(0, 300) + '...');
    } catch (error) {
      console.log('❌ ' + ep.name + ' failed:', error.response?.status, error.response?.data || error.message);
    }
  }
}

main().catch(console.error);
