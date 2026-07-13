// Based on TxLINE devnet examples
require('dotenv').config();
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const axios = require('axios');
const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Running TxLINE Devnet Example...');

  // Load wallet
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  // Devnet config
  const rpcUrl = 'https://api.devnet.solana.com';
  const apiOrigin = 'https://txline-dev.txodds.com';
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  const txlTokenMint = new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG');

  const connection = new Connection(rpcUrl, 'confirmed');
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  // Try to load IDL from multiple sources
  let idl = null;
  const idlPaths = [
    path.join(__dirname, '../idl/txoracle.json'),
    path.join(__dirname, '../idl/onchain_idl.json'),
  ];

  for (const idlPath of idlPaths) {
    try {
      if (fs.existsSync(idlPath)) {
        idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
        console.log(`✅ IDL loaded from ${path.basename(idlPath)}`);
        break;
      }
    } catch (e) {
      console.log(`❌ Failed to load IDL from ${path.basename(idlPath)}`);
    }
  }

  if (!idl) {
    console.log('❌ No IDL found. Please download the IDL from TxLINE.');
    console.log('📝 Try: https://txline.txodds.com/documentation/programs/devnet');
    process.exit(1);
  }

  const program = new anchor.Program(idl, programId, provider);

  // Derive PDAs
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_treasury_v2')],
    programId
  );

  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    txlTokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pricing_matrix')],
    programId
  );

  const userTokenAccount = getAssociatedTokenAddressSync(
    txlTokenMint,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // Subscribe to free tier
  console.log('📝 Subscribing to free tier...');
  
  try {
    const txSig = await program.methods
      .subscribe(1, 4) // Service Level 1, 4 weeks
      .accounts({
        user: wallet.publicKey,
        pricingMatrix: pricingMatrixPda,
        tokenMint: txlTokenMint,
        userTokenAccount: userTokenAccount,
        tokenTreasuryVault: tokenTreasuryVault,
        tokenTreasuryPda: tokenTreasuryPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Subscription successful!');
    console.log('📝 Transaction:', txSig);
    fs.writeFileSync(path.join(__dirname, '../.txsig'), txSig);

    // Now activate
    console.log('📝 Activating API token...');
    const jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    const messageString = `${txSig}::${jwt}`;
    const message = new TextEncoder().encode(messageString);
    const signatureBytes = nacl.sign.detached(message, wallet.secretKey);
    const walletSignature = Buffer.from(signatureBytes).toString('base64');

    const activationResponse = await axios.post(
      `${apiOrigin}/api/token/activate`,
      {
        txSig,
        walletSignature,
        leagues: [],
      },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );

    const apiToken = activationResponse.data.token || activationResponse.data;
    console.log('✅ API Token activated!');
    console.log('🔑 Token:', apiToken);
    fs.writeFileSync(path.join(__dirname, '../.apitoken'), apiToken);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.logs) console.error('Logs:', error.logs);
  }
}

main().catch(console.error);
