const axios = require('axios');
const fs = require('fs');
const path = require('path');

class WorkingWorldCupAgent {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.fixtureHistory = {};
    this.signals = [];
  }

  async getFixtures(limit = 10) {
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

  // Since odds/snapshot doesn't work, we'll use historical scores to analyze
  analyzeFixture(fixture, scores) {
    const signal = {
      fixtureId: fixture.FixtureId,
      home: fixture.Participant1,
      away: fixture.Participant2,
      hasScores: scores !== null,
      timestamp: Date.now()
    };

    // If we have scores, analyze them
    if (scores && Array.isArray(scores) && scores.length > 0) {
      signal.scoreCount = scores.length;
      signal.lastScore = scores[scores.length - 1];
      
      // Detect if this is interesting (has multiple events)
      if (scores.length > 3) {
        signal.interesting = true;
        signal.reason = 'High activity: ' + scores.length + ' events';
      }
    }

    return signal;
  }

  async run() {
    console.log('🚀 World Cup Agent (using working endpoints)...');
    console.log('================================================\n');
    
    try {
      // Step 1: Get fixtures
      const fixtures = await this.getFixtures(10);
      console.log('📊 Found ' + fixtures.length + ' fixtures\n');
      
      if (fixtures.length === 0) {
        console.log('❌ No fixtures found. Check your token or network.');
        return;
      }

      // Step 2: Process each fixture
      for (let i = 0; i < fixtures.length; i++) {
        const fixture = fixtures[i];
        const fixtureId = fixture.FixtureId;
        
        console.log('🏟️  Match ' + (i+1) + '/' + fixtures.length);
        console.log('   ' + fixture.Participant1 + ' vs ' + fixture.Participant2);
        console.log('   Fixture ID: ' + fixtureId);
        console.log('   Competition: ' + fixture.Competition);
        
        // Get historical scores for this fixture
        const scores = await this.getHistoricalScores(fixtureId);
        
        if (scores) {
          console.log('   📊 Scores found for this match');
          const scoreCount = Array.isArray(scores) ? scores.length : 1;
          console.log('   📊 ' + scoreCount + ' score events');
        } else {
          console.log('   📊 No scores available yet');
        }
        
        console.log('');
      }

      console.log('✅ Agent run complete!');
      
    } catch (error) {
      console.error('❌ Agent error:', error.response?.data || error.message);
    }
  }
}

// Run the agent
const agent = new WorkingWorldCupAgent();
agent.run().catch(console.error);
