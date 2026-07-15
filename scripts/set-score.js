#!/usr/bin/env node
// scripts/set-score.js
// Usage: node scripts/set-score.js <fixtureId> <homeScore> <awayScore>
// Example: node scripts/set-score.js 18241006 2 1

const axios = require('axios');
const path = require('path');

// Load env vars from .env if it exists
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, use process.env directly
}

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node scripts/set-score.js <fixtureId> <homeScore> <awayScore>');
  console.log('Example: node scripts/set-score.js 18241006 2 1');
  process.exit(1);
}

const fixtureId = args[0];
const homeScore = parseInt(args[1]);
const awayScore = parseInt(args[2]);

const adminKey = process.env.ADMIN_KEY || 'fallback-dev-key-change-me';
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

console.log(`📝 Setting score for fixture ${fixtureId}: ${homeScore}-${awayScore}`);
console.log(`🔗 Using API: ${baseUrl}/api/admin/scores`);

axios.post(`${baseUrl}/api/admin/scores`, {
  fixtureId,
  homeScore,
  awayScore
}, {
  headers: {
    'X-Admin-Key': adminKey,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('✅ Score set successfully:', res.data.message);
})
.catch(err => {
  if (err.response) {
    console.error('❌ Error:', err.response.data.error || err.response.statusText);
    if (err.response.status === 401) {
      console.error('🔑 ADMIN_KEY mismatch - check your environment variable');
    }
  } else {
    console.error('❌ Error:', err.message);
  }
  process.exit(1);
});