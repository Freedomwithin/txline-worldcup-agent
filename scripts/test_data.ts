import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('📡 Testing TxLINE API Access...');
  
  // Load JWT
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  console.log('✅ JWT loaded');

  try {
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
    console.log('📊 Response:', JSON.stringify(response.data, null, 2).slice(0, 500) + '...');
    
  } catch (error: any) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

main().catch(console.error);
