const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Fetching program data from devnet...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  
  // Get program account info
  const accountInfo = await connection.getAccountInfo(programId);
  
  if (!accountInfo) {
    console.log('❌ Program not found on devnet');
    process.exit(1);
  }
  
  console.log('✅ Program found on devnet!');
  console.log('📝 Account data length:', accountInfo.data.length);
  
  // Save the raw data
  fs.writeFileSync(path.join(__dirname, '../idl/program_data.bin'), accountInfo.data);
  console.log('📝 Raw data saved to idl/program_data.bin');
  
  // The IDL might be stored at a specific address
  // Try to find the IDL address
  console.log('📝 Looking for IDL account...');
  
  // Try to derive the IDL address
  const [idlAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from('idl')],
    programId
  );
  console.log('📝 Potential IDL address:', idlAddress.toBase58());
  
  try {
    const idlAccount = await connection.getAccountInfo(idlAddress);
    if (idlAccount) {
      console.log('✅ IDL account found!');
      fs.writeFileSync(path.join(__dirname, '../idl/idl_data.bin'), idlAccount.data);
      console.log('📝 IDL data saved to idl/idl_data.bin');
      
      // Try to parse as JSON
      try {
        const idlJson = JSON.parse(idlAccount.data.toString());
        fs.writeFileSync(path.join(__dirname, '../idl/txoracle.json'), JSON.stringify(idlJson, null, 2));
        console.log('✅ IDL parsed and saved to idl/txoracle.json');
      } catch (e) {
        console.log('📝 IDL data is not valid JSON, might be compressed');
      }
    } else {
      console.log('❌ IDL account not found at expected address');
    }
  } catch (error) {
    console.error('❌ Error fetching IDL account:', error.message);
  }
}

main().catch(console.error);
