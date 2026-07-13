const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

async function main() {
  console.log('🔍 Fetching IDL from on-chain program...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  
  try {
    // Get program account info
    const accountInfo = await connection.getAccountInfo(programId);
    console.log('✅ Program found!');
    console.log('📝 Data length:', accountInfo.data.length);
    
    // Try to parse as IDL
    try {
      const idl = JSON.parse(accountInfo.data.toString());
      console.log('✅ IDL parsed!');
      fs.writeFileSync('./idl/onchain_idl.json', JSON.stringify(idl, null, 2));
      console.log('📝 IDL saved to idl/onchain_idl.json');
    } catch (e) {
      console.log('📝 Could not parse as JSON directly, trying to find IDL...');
    }
  } catch (error) {
    console.error('❌ Program not found or not accessible:', error.message);
  }
}

main().catch(console.error);
