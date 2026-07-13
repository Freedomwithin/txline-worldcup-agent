require('dotenv').config();
const { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Direct Subscription (Fixed)...');

  // Load wallet
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('💰 Balance:', balance / 1e9, 'SOL');

  // Derive accounts
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_treasury_v2')],
    programId
  );

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pricing_matrix')],
    programId
  );

  console.log('📝 Program:', programId.toBase58());
  console.log('📝 Token Treasury:', tokenTreasuryPda.toBase58());
  console.log('📝 Pricing Matrix:', pricingMatrixPda.toBase58());

  // Build instruction data: serviceLevelId (u8) + durationWeeks (u16)
  const SERVICE_LEVEL_ID = 1;
  const DURATION_WEEKS = 4;
  const instructionData = Buffer.alloc(3);
  instructionData.writeUInt8(SERVICE_LEVEL_ID, 0);
  instructionData.writeUInt16LE(DURATION_WEEKS, 1);

  console.log('📝 Instruction data:', instructionData.toString('hex'));

  // Create the instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG'), isSigner: false, isWritable: false },
      { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: programId,
    data: instructionData
  });

  const transaction = new Transaction().add(instruction);

  console.log('📝 Sending subscription transaction...');

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log('✅ Subscription successful!');
    console.log('📝 Transaction:', signature);
    fs.writeFileSync(path.join(__dirname, '../.txsig'), signature);
    console.log('📝 Transaction signature saved to .txsig');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('📝 Logs:', error.logs);
    }
  }
}

main().catch(console.error);
