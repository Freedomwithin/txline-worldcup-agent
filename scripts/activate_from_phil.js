require('dotenv').config();
const anchor = require('@coral-xyz/anchor');
const axios = require('axios');
const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔑 Trying to activate with dummy txSig...');

  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();

  // Try with a dummy txSig
  const txSig = 'simulated_tx_' + Date.now();
  console.log('📝 Using dummy txSig:', txSig);

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
    console.log('🔑 Token:', response.data.token || response.data);
  } catch (error) {
    console.error('❌ Activation failed:', error.response?.data || error.message);
    console.log('📝 This means you need to subscribe on-chain first.');
  }
}

main().catch(console.error);
