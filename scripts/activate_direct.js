require('dotenv').config();
const anchor = require('@coral-xyz/anchor');
const axios = require('axios');
const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔑 Direct Activation Test...');

  // Load wallet
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  // Load JWT
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  console.log('✅ JWT loaded');

  // Use a simulated transaction signature for testing
  const txSig = 'simulated_tx_' + Date.now();
  console.log('📝 Simulated tx:', txSig);

  // Sign activation message
  const SELECTED_LEAGUES = [];
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(',')}:${jwt}`;
  const message = new TextEncoder().encode(messageString);

  const signatureBytes = nacl.sign.detached(message, wallet.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString('base64');
  console.log('✅ Message signed');

  try {
    const activationResponse = await axios.post(
      'https://txline-dev.txodds.com/api/token/activate',
      {
        txSig,
        walletSignature,
        leagues: SELECTED_LEAGUES,
      },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );

    const apiToken = activationResponse.data.token || activationResponse.data;
    console.log('✅ API Token activated!');
    console.log('🔑 Token:', apiToken);
    fs.writeFileSync(path.join(__dirname, '../.apitoken'), apiToken);
    console.log('📝 Token saved to .apitoken');

  } catch (error) {
    console.error('❌ Activation failed:', error.response?.data || error.message);
    console.log('📝 This might mean you need to subscribe on-chain first.');
  }
}

main().catch(console.error);
