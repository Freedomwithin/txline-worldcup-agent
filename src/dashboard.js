const axios = require('axios');
const fs = require('fs');
const path = require('path');

class WorldCupDashboard {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
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

  async generateDashboard() {
    console.log('📊 WORLD CUP DASHBOARD');
    console.log('======================\n');
    console.log('🕐 ' + new Date().toLocaleString());
    console.log('');

    const fixtures = await this.getFixtures();
    const worldCupFixtures = fixtures.filter(f => f.Competition === 'World Cup');
    
    console.log('📊 Total World Cup Matches: ' + worldCupFixtures.length);
    console.log('');

    // Create a simple table
    console.log('📅 MATCH SCHEDULE');
    console.log('-----------------');
    console.log('');

    for (const fixture of worldCupFixtures) {
      const startTime = new Date(fixture.StartTime || fixture.Ts || Date.now());
      const now = new Date();
      const isPast = startTime < now;
      const isSoon = startTime > now && startTime < new Date(now.getTime() + 3 * 60 * 60 * 1000);
      
      let statusIcon = '⏳';
      if (isPast) statusIcon = '✅';
      else if (isSoon) statusIcon = '🔴';
      
      const dateStr = startTime.toLocaleDateString();
      const timeStr = startTime.toLocaleTimeString();
      
      console.log(statusIcon + ' ' + fixture.Participant1 + ' vs ' + fixture.Participant2);
      console.log('   📍 ' + dateStr + ' at ' + timeStr);
      
      // Get scores for past matches
      if (isPast) {
        const scores = await this.getScores(fixture.FixtureId);
        if (scores) {
          console.log('   📊 Scores available');
        }
      }
      
      console.log('');
    }

    console.log('📊 LEGEND:');
    console.log('   ✅ Completed');
    console.log('   🔴 Live / Starting soon');
    console.log('   ⏳ Upcoming');
  }

  async run() {
    await this.generateDashboard();
  }
}

const dashboard = new WorldCupDashboard();
dashboard.run().catch(console.error);
