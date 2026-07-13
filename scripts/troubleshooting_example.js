require('dotenv').config();
const { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Trying Troubleshooting Page Example...');

  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  const txlTokenMint = new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG');

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

  // Try with the Anchor program
  try {
    // Create a minimal program with the IDL from the troubleshooting page
    const idl = {
      version: '0.1.0',
      name: 'txoracle',
      instructions: [
        {
          name: 'subscribe',
          accounts: [
            { name: 'user', isMut: true, isSigner: true },
            { name: 'pricingMatrix', isMut: false, isSigner: false },
            { name: 'tokenMint', isMut: false, isSigner: false },
            { name: 'userTokenAccount', isMut: true, isSigner: false },
            { name: 'tokenTreasuryVault', isMut: true, isSigner: false },
            { name: 'tokenTreasuryPda', isMut: false, isSigner: false },
            { name: 'tokenProgram', isMut: false, isSigner: false },
            { name: 'systemProgram', isMut: false, isSigner: false }
          ],
          args: [
            { name: 'serviceLevelId', type: 'u8' },
            { name: 'durationWeeks', type: 'u16' }
          ]
        }
      ]
    };

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    // Try to create the program
    const program = new anchor.Program(idl, programId, provider);

    console.log('📝 Attempting to subscribe using Anchor...');

    const txSig = await program.methods
      .subscribe(1, 4)
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

  } catch (error) {
    console.error('❌ Anchor method failed:', error.message);
    console.log('📝 Trying raw instruction instead...');

    try {
      // Fallback to raw instruction
      const instructionData = Buffer.alloc(3);
      instructionData.writeUInt8(1, 0);
      instructionData.writeUInt16LE(4, 1);

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
      const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
      console.log('✅ Raw subscription successful!');
      console.log('📝 Transaction:', signature);
      fs.writeFileSync(path.join(__dirname, '../.txsig'), signature);

    } catch (rawError) {
      console.error('❌ Raw instruction also failed:', rawError.message);
      if (rawError.logs) {
        console.log('📝 Logs:', rawError.logs.join('\n'));
      }
    }
  }
}

main().catch(console.error);
