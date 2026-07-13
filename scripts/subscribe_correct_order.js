require('dotenv').config();
const { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Correct Account Order...');

  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  const txlTokenMint = new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG');

  // Check balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');

  // Derive PDAs
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_treasury_v2')],
    programId
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

  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    txlTokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  console.log('📝 Accounts:');
  console.log('  User:', wallet.publicKey.toBase58());
  console.log('  Pricing Matrix:', pricingMatrixPda.toBase58());
  console.log('  Token Mint:', txlTokenMint.toBase58());
  console.log('  User Token Account:', userTokenAccount.toBase58());
  console.log('  Token Treasury Vault:', tokenTreasuryVault.toBase58());
  console.log('  Token Treasury PDA:', tokenTreasuryPda.toBase58());

  // Build instruction data
  const SERVICE_LEVEL_ID = 1;
  const DURATION_WEEKS = 4;
  const instructionData = Buffer.alloc(3);
  instructionData.writeUInt8(SERVICE_LEVEL_ID, 0);
  instructionData.writeUInt16LE(DURATION_WEEKS, 1);

  console.log('📝 Instruction data:', instructionData.toString('hex'));

  // Create instruction with correct account order from docs
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },
      { pubkey: txlTokenMint, isSigner: false, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: programId,
    data: instructionData
  });

  const transaction = new Transaction().add(instruction);

  console.log('📝 Sending subscription...');

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log('✅ Subscription successful!');
    console.log('📝 Transaction:', signature);
    fs.writeFileSync(path.join(__dirname, '../.txsig'), signature);
    console.log('📝 Transaction signature saved to .txsig');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('📝 Logs:', error.logs.join('\n'));
    }
  }
}

main().catch(console.error);
