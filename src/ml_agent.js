const fs = require('fs');
const path = require('path');

class MLPatternDetector {
  constructor() {
    this.teamRankings = {};
    this.history = [];
    this.patterns = [];
    this.confidence = 0.5;
    this.loadTeamRankings();
  }

  loadTeamRankings() {
    try {
      const filePath = path.join(__dirname, '../data/team_rankings.json');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.teamRankings = data.teams || {};
      console.log('✅ Team rankings loaded');
    } catch (error) {
      console.error('Error loading team rankings:', error.message);
    }
  }

  getTeamStrength(team) {
    const teamData = this.teamRankings[team];
    if (teamData) {
      return {
        rank: teamData.rank,
        points: teamData.points,
        goals_avg: teamData.goals_avg,
        tier: teamData.tier
      };
    }
    return { rank: 999, points: 0, goals_avg: 0, tier: 'unknown' };
  }

  analyzeMatch(match) {
    const homeStrength = this.getTeamStrength(match.home);
    const awayStrength = this.getTeamStrength(match.away);
    
    const rankDiff = awayStrength.rank - homeStrength.rank;
    const pointsDiff = homeStrength.points - awayStrength.points;
    
    let prediction = 'DRAW';
    let confidence = 0.5;
    let expectedGoals = 0;
    
    if (rankDiff > 20) {
      prediction = 'HOME WIN';
      confidence = 0.7 + (rankDiff / 200);
      expectedGoals = (homeStrength.goals_avg + awayStrength.goals_avg) / 2 + 0.3;
    } else if (rankDiff < -20) {
      prediction = 'AWAY WIN';
      confidence = 0.7 + (Math.abs(rankDiff) / 200);
      expectedGoals = (homeStrength.goals_avg + awayStrength.goals_avg) / 2 + 0.3;
    }
    
    return {
      match: match.home + ' vs ' + match.away,
      home_rank: homeStrength.rank,
      away_rank: awayStrength.rank,
      prediction: prediction,
      confidence: Math.min(confidence, 0.95),
      expectedGoals: expectedGoals,
      tier_matchup: `${homeStrength.tier} vs ${awayStrength.tier}`
    };
  }

  predict(match) {
    const analysis = this.analyzeMatch(match);
    
    return {
      fixture: match.home + ' vs ' + match.away,
      prediction: analysis.prediction === 'HOME WIN' ? 'BUY' : 
                  analysis.prediction === 'AWAY WIN' ? 'SELL' : 'HOLD',
      confidence: analysis.confidence,
      reason: `Rank ${analysis.home_rank} vs ${analysis.away_rank}, ${analysis.tier_matchup}`,
      expectedGoals: analysis.expectedGoals,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { MLPatternDetector };
