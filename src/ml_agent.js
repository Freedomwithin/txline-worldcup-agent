const fs = require('fs');
const path = require('path');

class MLPatternDetector {
  constructor() {
    this.teamRankings = {};
    this.history = [];
    this.patterns = [];
    this.confidence = 0.5;
    this.threshold = 5; // Lowered from 10 to be more sensitive
    this.loadTeamRankings();
  }

  loadTeamRankings() {
    try {
      const filePath = path.join(__dirname, '../data/team_rankings.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.teamRankings = data.teams || {};
        console.log('✅ Team rankings loaded');
      } else {
        console.log('⚠️ Team rankings file not found, using defaults');
      }
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
    let confidence = 0.50;
    let expectedGoals = 0;
    
    // More aggressive prediction logic
    if (rankDiff > this.threshold) {
      // Home team is significantly better
      prediction = 'BUY';
      confidence = Math.min(0.55 + (rankDiff / 150), 0.92);
    } else if (rankDiff < -this.threshold) {
      // Away team is significantly better
      prediction = 'SELL';
      confidence = Math.min(0.55 + (Math.abs(rankDiff) / 150), 0.92);
    } else {
      // Close match - use points difference as tiebreaker
      if (pointsDiff > 50) {
        prediction = 'BUY';
        confidence = 0.55;
      } else if (pointsDiff < -50) {
        prediction = 'SELL';
        confidence = 0.55;
      } else {
        prediction = 'HOLD';
        confidence = 0.50;
      }
    }
    
    expectedGoals = (homeStrength.goals_avg + awayStrength.goals_avg) / 2;
    
    return {
      match: match.home + ' vs ' + match.away,
      home_rank: homeStrength.rank,
      away_rank: awayStrength.rank,
      rank_diff: rankDiff,
      points_diff: pointsDiff,
      prediction: prediction,
      confidence: confidence,
      expectedGoals: expectedGoals,
      tier_matchup: `${homeStrength.tier} vs ${awayStrength.tier}`
    };
  }

  predict(match) {
    const analysis = this.analyzeMatch(match);
    
    return {
      fixture: match.home + ' vs ' + match.away,
      prediction: analysis.prediction,
      confidence: analysis.confidence,
      reason: `Rank ${analysis.home_rank} vs ${analysis.away_rank} (diff: ${analysis.rank_diff})`,
      expectedGoals: analysis.expectedGoals,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { MLPatternDetector };
