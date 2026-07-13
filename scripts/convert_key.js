// Simple script to convert base58 to JSON array
const { decode } = require('bs58');

// Your base58 private key from Solflare
const base58Key = '5giGrXdrEUqBhj8qhbWkrxrCkmTkXSquTHhf2FaKe4xsBCEr6dGw2e8xWQEgn9bAtBJqUrP61d2CfSAxdYUbiS2y';

try {
  // Decode from base58 to bytes
  const keyBytes = decode(base58Key);
  
  // Convert to JSON array
  const keyArray = Array.from(keyBytes);
  
  console.log('✅ Your private key as JSON array:');
  console.log(JSON.stringify(keyArray));
  console.log('\n📝 Copy this array into your .env file as WALLET_PRIVATE_KEY');
  
} catch (error) {
  console.error('❌ Error converting key:', error.message);
}
