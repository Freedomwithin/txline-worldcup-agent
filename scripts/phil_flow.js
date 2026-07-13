const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📡 Following Uncle Phil\'s flow...');

  // Step 1: Get guest token
  console.log('Step 1: Getting guest JWT...');
  const authResponse = await axios.post('https://txline-dev.txodds.com/auth/guest/start');
  const jwt = authResponse.data.token;
  console.log('✅ Guest JWT obtained:', jwt.slice(0, 50) + '...');

  // Step 2: Try to activate (Uncle Phil says this works without a real subscription?)
  console.log('\nStep 2: Trying to activate...');
  
  // Get wallet for signing
  const anchor = require('@coral-xyz/anchor');
  const nacl = require('tweetnacl');
  require('dotenv').config();
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  
  const txSig = 'simulated_' + Date.now();
  const messageString = `${txSig}::${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const signatureBytes = nacl.sign.detached(message, wallet.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString('base64');

  try {
    const response = await axios.post(
      'https://txline-dev.txodds.com/api/token/activate',
      { txSig, walletSignature, leagues: [] },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    console.log('✅ Activation successful!');
    console.log('🔑 API Token:', response.data.token || response.data);
    fs.writeFileSync(path.join(__dirname, '../.apitoken'), response.data.token || response.data);
  } catch (error) {
    console.error('❌ Activation failed:', error.response?.data || error.message);
    console.log('\n📝 If this fails, you need to subscribe on-chain first.');
    console.log('📝 Contact TxLINE support in Discord/Telegram for the correct IDL.');
  }
}

main().catch(console.error);
