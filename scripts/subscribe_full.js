require('dotenv').config();
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🏆 Subscribing to TxLINE Free Tier on Devnet...');

  // Load wallet
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  // Devnet config from docs
  const rpcUrl = 'https://api.devnet.solana.com';
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  const txlTokenMint = new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG');

  const connection = new Connection(rpcUrl, 'confirmed');
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  // Load IDL
  const idlPath = path.join(__dirname, '../idl/txoracle.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
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

  // Free tier: Service Level 1, 4 weeks
  const SERVICE_LEVEL_ID = 1;
  const DURATION_WEEKS = 4;

  console.log('📝 Subscribing to free tier...');
  console.log('📝 Service Level:', SERVICE_LEVEL_ID);
  console.log('📝 Duration:', DURATION_WEEKS, 'weeks');

  try {
    const txSig = await program.methods
      .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
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
    console.log('📝 Transaction signature saved to .txsig');

  } catch (error) {
    console.error('❌ Subscription failed:', error.message);
    if (error.logs) {
      console.error('📝 Logs:', error.logs);
    }
  }
}

main().catch(console.error);
