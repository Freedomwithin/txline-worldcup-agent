const { Connection, PublicKey } = require('@solana/web3.js');

async function main() {
  console.log('🔍 Checking mainnet program...');
  
  const programId = new PublicKey('9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA');
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  
  const accountInfo = await connection.getAccountInfo(programId);
  
  console.log('✅ Program found!');
  console.log('📝 Data length:', accountInfo.data.length);
  console.log('📝 Executable:', accountInfo.executable);
  console.log('📝 Owner:', accountInfo.owner.toBase58());
  console.log('📝 First 100 bytes:', accountInfo.data.slice(0, 100).toString('hex'));
}

main().catch(console.error);
