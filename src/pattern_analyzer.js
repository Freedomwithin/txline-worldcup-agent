const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PatternAnalyzer {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.analysis = {
      totalMatches: 0,
      competitions: {},
      teams: {},
      matchTimes: []
    };
  }

  async getFixtures() {
    try {
      const response = await axios.get(
        this.baseUrl + '/fixtures/snapshot?limit=50',
        {
          headers: {
            'Authorization': 'Bearer ' + this.jwt,
            'X-Api-Token': this.apiToken
          }
        }
      );
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  analyzeFixtures(fixtures) {
    this.analysis.totalMatches = fixtures.length;
    
    for (const fixture of fixtures) {
      // Track competitions
      const comp = fixture.Competition || 'Unknown';
      this.analysis.competitions[comp] = (this.analysis.competitions[comp] || 0) + 1;
      
      // Track teams
      const team1 = fixture.Participant1;
      const team2 = fixture.Participant2;
      this.analysis.teams[team1] = (this.analysis.teams[team1] || 0) + 1;
      this.analysis.teams[team2] = (this.analysis.teams[team2] || 0) + 1;
      
      // Track match times
      if (fixture.StartTime) {
        const date = new Date(fixture.StartTime);
        this.analysis.matchTimes.push({
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          fixture: team1 + ' vs ' + team2
        });
      }
    }
  }

  printAnalysis() {
    console.log('📊 PATTERN ANALYSIS');
    console.log('===================\n');
    
    console.log('📈 Total Matches: ' + this.analysis.totalMatches);
    console.log('');
    
    console.log('🏆 Competitions:');
    const sortedComps = Object.entries(this.analysis.competitions)
      .sort((a, b) => b[1] - a[1]);
    for (const [comp, count] of sortedComps) {
      console.log('   ' + comp + ': ' + count + ' matches');
    }
    console.log('');
    
    console.log('⚽ Top Teams:');
    const sortedTeams = Object.entries(this.analysis.teams)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [team, count] of sortedTeams) {
      console.log('   ' + team + ': ' + count + ' appearances');
    }
    console.log('');
    
    console.log('📅 Upcoming Matches:');
    const now = Date.now();
    const upcoming = this.analysis.matchTimes
      .filter(m => new Date(m.date + ' ' + m.time).getTime() > now)
      .slice(0, 5);
    for (const match of upcoming) {
      console.log('   ' + match.date + ' at ' + match.time + ' - ' + match.fixture);
    }
  }

  async run() {
    console.log('🔍 Pattern Analyzer Starting...\n');
    
    const fixtures = await this.getFixtures();
    this.analyzeFixtures(fixtures);
    this.printAnalysis();
    
    console.log('\n✅ Analysis complete');
  }
}

const analyzer = new PatternAnalyzer();
analyzer.run().catch(console.error);
