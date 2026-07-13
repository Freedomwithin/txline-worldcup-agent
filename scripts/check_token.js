const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Checking API token validity...');
  
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
  
  console.log('✅ JWT loaded');
  console.log('✅ API Token:', apiToken);
  
  // Try the odds endpoint (which we know works from the script)
  try {
    const response = await axios.get(
      'https://txline-dev.txodds.com/api/odds',
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'X-Api-Token': apiToken
        }
      }
    );
    console.log('✅ Odds endpoint working!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2).slice(0, 500));
  } catch (error: any) {
    console.log('❌ Odds failed:', error.response?.status, error.response?.data || error.message);
  }
  
  // Try the scores endpoint
  try {
    const response = await axios.get(
      'https://txline-dev.txodds.com/api/scores',
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'X-Api-Token': apiToken
        }
      }
    );
    console.log('✅ Scores endpoint working!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2).slice(0, 500));
  } catch (error: any) {
    console.log('❌ Scores failed:', error.response?.status, error.response?.data || error.message);
  }
}

main().catch(console.error);
