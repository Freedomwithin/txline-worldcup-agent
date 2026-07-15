// src/manual_scores.js
const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, '../data/manual_scores.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load manual scores from disk
function loadManualScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading manual scores:', e.message);
  }
  return {};
}

// Save manual scores to disk
function saveManualScores(scores) {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    console.log('💾 Manual scores saved');
  } catch (e) {
    console.error('Error saving manual scores:', e.message);
  }
}

// Set a manual score for a fixture
function setManualScore(fixtureId, homeScore, awayScore) {
  const scores = loadManualScores();
  scores[fixtureId] = { homeScore, awayScore, hasData: true };
  saveManualScores(scores);
  console.log(`📝 Manual score set for fixture ${fixtureId}: ${homeScore}-${awayScore}`);
}

// Get manual score for a fixture
function getManualScore(fixtureId) {
  const scores = loadManualScores();
  return scores[fixtureId] || null;
}

module.exports = {
  loadManualScores,
  saveManualScores,
  setManualScore,
  getManualScore
};