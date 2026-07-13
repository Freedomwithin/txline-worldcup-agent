const anchor = require('@coral-xyz/anchor');
const axios = require('axios');
const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('🔑 Activating TxLINE API Token...');

  // Load wallet
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY || '[]');
  if (privateKey.length === 0) {
    console.error('❌ No private key found in .env');
    process.exit(1);
  }
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));

  // Load JWT and transaction signature
  const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
  const txSig = fs.readFileSync(path.join(__dirname, '../.txsig'), 'utf8').trim();

  console.log('✅ Wallet:', wallet.publicKey.toBase58());
  console.log('✅ JWT loaded');
  console.log('✅ Transaction signature:', txSig);

  // Sign activation message
  const SELECTED_LEAGUES = [];
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(',')}:${jwt}`;
  const message = new TextEncoder().encode(messageString);

  const signatureBytes = nacl.sign.detached(message, wallet.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString('base64');
  console.log('✅ Message signed');

  // Activate
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
    console.log('✅ API Token activated successfully!');
    console.log('🔑 Your API Token:', apiToken);
    fs.writeFileSync(path.join(__dirname, '../.apitoken'), apiToken);
    console.log('📝 API Token saved to .apitoken');

  } catch (error) {
    console.error('❌ Activation failed:', error.response?.data || error.message);
  }
}

main().catch(console.error);
