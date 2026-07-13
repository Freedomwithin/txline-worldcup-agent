const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📡 Testing API with activated token...');
  
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();

  try {
    const response = await axios.get(
      'https://txline-dev.txodds.com/api/fixtures',
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'X-Api-Token': apiToken
        }
      }
    );
    console.log('✅ API working!');
    console.log('📊 Fixtures:', JSON.stringify(response.data, null, 2).slice(0, 500) + '...');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

main().catch(console.error);
