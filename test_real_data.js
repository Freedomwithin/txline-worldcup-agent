const { MLPatternDetector } = require('./src/ml_agent');
const fs = require('fs');
const path = require('path');

// Load matches
const matchesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/historical_matches.json'), 'utf8')
);

const detector = new MLPatternDetector();

console.log('📊 Testing ML Pattern Detector with Real Data');
console.log('==============================================\n');

for (const match of matchesData.matches) {
  console.log(`🏟️  ${match.home} vs ${match.away}`);
  console.log(`   📊 Home Rank: ${match.home_rank}, Away Rank: ${match.away_rank}`);
  
  const prediction = detector.predict(match);
  console.log(`   🧠 Prediction: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(0)}%)`);
  console.log(`   💡 ${prediction.reason}`);
  console.log('');
}
