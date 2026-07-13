const { Connection, PublicKey } = require('@solana/web3.js');

async function main() {
  console.log('🔍 Checking devnet program...');
  
  const programId = new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J');
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Get program account info
  const accountInfo = await connection.getAccountInfo(programId);
  
  console.log('✅ Program found!');
  console.log('📝 Data length:', accountInfo.data.length);
  console.log('📝 Executable:', accountInfo.executable);
  console.log('📝 Owner:', accountInfo.owner.toBase58());
  
  // Try to find instruction names in the data
  const data = accountInfo.data;
  const searchTerms = ['subscribe', 'activate', 'register', 'create'];
  
  for (const term of searchTerms) {
    const termBytes = Buffer.from(term);
    if (data.includes(termBytes)) {
      console.log(`✅ Found "${term}" in program data`);
    }
  }
  
  // Check if the program has a discriminator table
  console.log('\n📝 First 100 bytes of program data:');
  console.log(data.slice(0, 100).toString('hex'));
}

main().catch(console.error);
