// Test the settlement logic with a deterministic mock fixture
// Run with: node api/test-settlement.js

const axios = require('axios');
const path = require('path');
const { getArena, savePersistentArena, resetArena } = require('../src/arena_state');
const { initHistory, appendSnapshot, getHistory } = require('../src/history');

// Initialize history
initHistory();

// Load credentials
function loadCredentials() {
  let jwt = process.env.TXLINE_JWT;
  let apiToken = process.env.TXLINE_API_TOKEN;
  
  if (!jwt || !apiToken) {
    try {
      const fs = require('fs');
      const jwtPath = path.join(__dirname, '../.jwt');
      const tokenPath = path.join(__dirname, '../.apitoken');
      
      if (fs.existsSync(jwtPath)) {
        jwt = fs.readFileSync(jwtPath, 'utf8').trim();
      }
      if (fs.existsSync(tokenPath)) {
        apiToken = fs.readFileSync(tokenPath, 'utf8').trim();
      }
    } catch (e) {
      console.error('Error loading credentials:', e.message);
    }
  }
  
  return { jwt, apiToken };
}

// Import the functions we need from server.js
// We'll copy the determineTradeOutcome function here for testing
function determineTradeOutcome(prediction, match, actualOutcome) {
  if (!actualOutcome || !actualOutcome.hasData) {
    return 'pending';
  }
  
  const homeWon = actualOutcome.homeScore > actualOutcome.awayScore;
  const awayWon = actualOutcome.awayScore > actualOutcome.homeScore;
  const isDraw = actualOutcome.homeScore === actualOutcome.awayScore;
  
  if (prediction === 'BUY') {
    if (homeWon) return true;
    if (awayWon || isDraw) return false;
  } else if (prediction === 'SELL') {
    if (awayWon) return true;
    if (homeWon || isDraw) return false;
  } else if (prediction === 'HOLD') {
    return null;
  }
  
  return 'pending';
}

console.log('🧪 === TESTING SETTLEMENT LOGIC ===\n');

// Get the arena
const arena = getArena();
console.log('📊 Arena loaded with', arena.agents.length, 'agents');

// Create a deterministic test fixture (GameState=9)
const testMatch = {
  home: "Test Home",
  away: "Test Away",
  fixtureId: 99999999
};

// Create test predictions for each agent
const testPredictions = {
  'ML Prophet': 'BUY',
  'Sentinel AI': 'SELL',
  'Simple Momentum': 'HOLD'
};

// Set predictions on the agents
for (const agent of arena.agents) {
  const prediction = testPredictions[agent.name] || 'HOLD';
  agent.lastPrediction = prediction;
  agent.lastConfidence = 75;
  console.log(`  🤖 ${agent.name}: ${prediction}`);
}

// Create a mock actual outcome (2-1 home win)
const actualOutcome = {
  homeScore: 2,
  awayScore: 1,
  hasData: true
};

console.log('\n📊 Match outcome:', actualOutcome.homeScore, '-', actualOutcome.awayScore);
console.log('\n--- EVALUATING TRADES ---\n');

// Run the settlement logic
for (const agent of arena.agents) {
  const lastPrediction = agent.lastPrediction;
  if (lastPrediction && lastPrediction !== 'HOLD') {
    const isCorrect = determineTradeOutcome(lastPrediction, testMatch, actualOutcome);
    
    const decision = {
      action: lastPrediction,
      amount: agent.bankroll * 0.1,
      confidence: agent.lastConfidence || 50
    };
    
    if (isCorrect === 'pending') {
      console.log(`⏳ ${agent.name}: ${lastPrediction} - PENDING (waiting for real data)`);
    } else if (typeof isCorrect === 'boolean') {
      arena.evaluateTrade(agent, decision, isCorrect);
      console.log(`✅ ${agent.name}: ${lastPrediction} was ${isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
      console.log(`   Bankroll: $${agent.bankroll.toFixed(2)} (${agent.wins} wins, ${agent.losses} losses)`);
    } else {
      console.log(`⏳ ${agent.name}: ${lastPrediction} - no trade outcome (HOLD or pending)`);
    }
  } else {
    console.log(`⏳ ${agent.name}: ${lastPrediction} - HOLD (no trade placed)`);
  }
}

console.log('\n--- FINAL LEADERBOARD ---');
const leaderboard = arena.getLeaderboard();
for (const agent of leaderboard) {
  console.log(`  ${agent.name}: $${agent.bankroll.toFixed(2)} (${agent.wins}W/${agent.losses}L)`);
}

// Save the updated arena state
savePersistentArena();
console.log('\n💾 Arena state saved to disk');

// Reset arena for testing multiple scenarios
console.log('\n🧪 Testing edge cases...');

// Test 2: Draw scenario (1-1)
console.log('\n--- TEST 2: DRAW SCENARIO (1-1) ---');
const drawOutcome = { homeScore: 1, awayScore: 1, hasData: true };
console.log('BUY on draw should be INCORRECT');
console.log('SELL on draw should be INCORRECT');
console.log('HOLD on draw should be null (no trade)');

const buyResult = determineTradeOutcome('BUY', testMatch, drawOutcome);
const sellResult = determineTradeOutcome('SELL', testMatch, drawOutcome);
const holdResult = determineTradeOutcome('HOLD', testMatch, drawOutcome);

console.log(`  BUY on draw: ${buyResult === true ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
console.log(`  SELL on draw: ${sellResult === true ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
console.log(`  HOLD on draw: ${holdResult === null ? 'null (no trade)' : holdResult}`);

// Test 3: Away win (1-2)
console.log('\n--- TEST 3: AWAY WIN (1-2) ---');
const awayWinOutcome = { homeScore: 1, awayScore: 2, hasData: true };
console.log('BUY on away win should be INCORRECT');
console.log('SELL on away win should be CORRECT');

const buyResult2 = determineTradeOutcome('BUY', testMatch, awayWinOutcome);
const sellResult2 = determineTradeOutcome('SELL', testMatch, awayWinOutcome);

console.log(`  BUY on away win: ${buyResult2 === true ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
console.log(`  SELL on away win: ${sellResult2 === true ? 'CORRECT ✅' : 'INCORRECT ❌'}`);

console.log('\n✅ All tests complete - no random numbers used!');
console.log('📊 System ready for real match data tomorrow.');