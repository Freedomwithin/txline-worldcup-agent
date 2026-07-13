const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LiveScoreMonitor {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.monitoredFixtures = new Map();
    this.running = true;
  }

  async getFixtures() {
    try {
      const response = await axios.get(
        this.baseUrl + '/fixtures/snapshot?limit=20',
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

  async getScores(fixtureId) {
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

  isMatchLiveOrSoon(fixture) {
    const now = Date.now();
    const startTime = fixture.StartTime || 0;
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    
    // Match is live or starting soon (within 3 hours)
    return startTime <= now + threeHoursInMs && startTime > now - 2 * 60 * 60 * 1000;
  }

  async monitor() {
    console.log('🔴 Live Score Monitor Starting...');
    console.log('================================\n');

    const fixtures = await this.getFixtures();
    const worldCupFixtures = fixtures.filter(f => f.Competition === 'World Cup');
    
    console.log('📊 Found ' + worldCupFixtures.length + ' World Cup fixtures\n');

    for (const fixture of worldCupFixtures) {
      const startTime = new Date(fixture.StartTime || fixture.Ts || Date.now());
      const now = new Date();
      const timeUntilStart = Math.max(0, Math.floor((startTime - now) / 1000 / 60));
      
      const status = this.isMatchLiveOrSoon(fixture) ? '🔴 LIVE/SOON' : '⏳ Scheduled';
      
      console.log('🏟️  ' + fixture.Participant1 + ' vs ' + fixture.Participant2);
      console.log('   Status: ' + status);
      console.log('   Start: ' + startTime.toLocaleString());
      
      if (timeUntilStart > 0) {
        console.log('   ⏰ ' + timeUntilStart + ' minutes until kickoff');
      }
      
      // Check if match has started and get scores
      if (fixture.StartTime && fixture.StartTime <= Date.now()) {
        const scores = await this.getScores(fixture.FixtureId);
        if (scores) {
          console.log('   📊 Scores available!');
          if (Array.isArray(scores) && scores.length > 0) {
            console.log('   📊 Latest event: ' + JSON.stringify(scores[scores.length-1], null, 2).slice(0, 100));
          }
        }
      }
      
      console.log('');
    }
  }

  async run() {
    await this.monitor();
    console.log('✅ Monitor run complete');
  }
}

const monitor = new LiveScoreMonitor();
monitor.run().catch(console.error);
