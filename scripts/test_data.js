const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📡 Testing TxLINE API Access...');
  
  try {
    // Load JWT
    const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    console.log('✅ JWT loaded');

    // Test getting fixtures
    console.log('📊 Fetching World Cup fixtures...');
    const response = await axios.get(
      'https://txline-dev.txodds.com/api/fixtures',
      {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }
    );
    
    console.log('✅ API working!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2).slice(0, 800) + '...');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API test failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main().catch(console.error);
