const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔑 Testing with correct headers...');
  
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
  
  console.log('✅ JWT:', jwt.slice(0, 50) + '...');
  console.log('✅ API Token:', apiToken);
  
  // Try the exact same request that worked in the script
  try {
    const response = await axios.get(
      'https://txline-dev.txodds.com/api/fixtures',
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'X-Api-Token': apiToken,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ API working!');
    console.log(`📊 Fixtures received:`, response.data.length || 'some data');
    console.log('📊 First fixture:', JSON.stringify(response.data[0] || response.data, null, 2).slice(0, 500));
    
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

main().catch(console.error);
