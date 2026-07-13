const axios = require('axios');
const fs = require('fs');
const path = require('path');

class EnhancedWorldCupAgent {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.knownFixtures = new Map();
    this.running = true;
  }

  async getFixtures(limit = 20) {
    try {
      const response = await axios.get(
        this.baseUrl + '/fixtures/snapshot?limit=' + limit,
        {
          headers: {
            'Authorization': 'Bearer ' + this.jwt,
            'X-Api-Token': this.apiToken
          }
        }
      );
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to get fixtures:', error.message);
      return [];
    }
  }

  async getHistoricalScores(fixtureId) {
    try {
      const response = await axios.get(
        this.baseUrl + '/scores/historical/' + fixtureId,
        {
          headers: {
            'Authorization': 'Bearer ' + this.jwt,
            'X-Api-Token': this.apiToken
          }
        }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  analyzeFixture(fixture) {
    const now = Date.now();
    const startTime = fixture.StartTime || fixture.Ts || 0;
    const isUpcoming = startTime > now;
    const isLive = startTime <= now && startTime > (now - 2 * 60 * 60 * 1000); // Started within last 2 hours
    
    return {
      id: fixture.FixtureId,
      home: fixture.Participant1,
      away: fixture.Participant2,
      competition: fixture.Competition,
      startTime: new Date(startTime).toLocaleString(),
      isUpcoming: isUpcoming,
      isLive: isLive,
      isHistoric: !isUpcoming && !isLive
    };
  }

  async run() {
    console.log('🚀 Enhanced World Cup Agent');
    console.log('============================\n');

    try {
      // Get fixtures
      const fixtures = await this.getFixtures(20);
      console.log('📊 Found ' + fixtures.length + ' fixtures\n');

      // Separate by status
      const upcoming = [];
      const live = [];
      const historic = [];

      for (const fixture of fixtures) {
        const analysis = this.analyzeFixture(fixture);
        if (analysis.isUpcoming) upcoming.push(analysis);
        else if (analysis.isLive) live.push(analysis);
        else historic.push(analysis);
      }

      // Display live matches (most important)
      if (live.length > 0) {
        console.log('🔴 LIVE MATCHES');
        console.log('----------------');
        for (const match of live) {
          console.log('   ⚽ ' + match.home + ' vs ' + match.away);
          console.log('      Started: ' + match.startTime);
        }
        console.log('');
      }

      // Display upcoming matches
      if (upcoming.length > 0) {
        console.log('📅 UPCOMING MATCHES');
        console.log('--------------------');
        for (const match of upcoming) {
          console.log('   ' + match.home + ' vs ' + match.away);
          console.log('      ' + match.competition + ' | ' + match.startTime);
        }
        console.log('');
      }

      // Display historic matches with scores
      if (historic.length > 0) {
        console.log('📜 HISTORIC MATCHES');
        console.log('-------------------');
        for (const match of historic) {
          console.log('   ' + match.home + ' vs ' + match.away);
          console.log('      ' + match.startTime);
          
          // Try to get scores for historic matches
          const scores = await this.getHistoricalScores(match.id);
          if (scores) {
            console.log('      ✅ Scores available');
          }
        }
        console.log('');
      }

      console.log('✅ Agent run complete!');
      console.log('📊 Summary:');
      console.log('   🔴 Live: ' + live.length);
      console.log('   📅 Upcoming: ' + upcoming.length);
      console.log('   📜 Historic: ' + historic.length);

    } catch (error) {
      console.error('❌ Agent error:', error.response?.data || error.message);
    }
  }
}

const agent = new EnhancedWorldCupAgent();
agent.run().catch(console.error);
