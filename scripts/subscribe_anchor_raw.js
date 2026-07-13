require('dotenv').config();
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Anchor Raw Subscription...');

  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY);
  const wallet = anchor.web3.Keypair.fromSecretKey(new Uint8Array(privateKey));
  console.log('✅ Wallet:', wallet.publicKey.toBase58());

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

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

  console.log('📝 Attempting to subscribe using raw Anchor coder...');

  // Create a minimal coder (we need the instruction layout)
  try {
    // Try to create the instruction directly
    const coder = new anchor.BorshInstructionCoder({
      version: '0.1.0',
      name: 'txoracle',
      instructions: [
        {
          name: 'subscribe',
          accounts: [
            { name: 'user' },
            { name: 'pricingMatrix' },
            { name: 'tokenMint' },
            { name: 'userTokenAccount' },
            { name: 'tokenTreasuryVault' },
            { name: 'tokenTreasuryPda' },
            { name: 'tokenProgram' },
            { name: 'systemProgram' }
          ],
          args: [
            { name: 'serviceLevelId', type: 'u8' },
            { name: 'durationWeeks', type: 'u16' }
          ]
        }
      ]
    });

    const txData = coder.encode('subscribe', {
      serviceLevelId: 1,
      durationWeeks: 4
    });

    console.log('📝 Encoded instruction data:', txData.toString('hex'));

    // Build the instruction
    const instruction = new anchor.web3.TransactionInstruction({
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
      data: txData
    });

    const transaction = new anchor.web3.Transaction().add(instruction);

    console.log('📝 Sending transaction...');

    const signature = await provider.sendAndConfirm(transaction);
    console.log('✅ Subscription successful!');
    console.log('📝 Transaction:', signature);
    fs.writeFileSync(path.join(__dirname, '../.txsig'), signature);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.logs) {
      console.error('📝 Logs:', error.logs.join('\n'));
    }
  }
}

main().catch(console.error);
