const axios = require('axios');
const fs = require('fs');
const path = require('path');

class RealtimeMonitor {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.running = true;
    this.interval = 30000; // Check every 30 seconds
    this.knownMatches = new Map();
    this.eventLog = [];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  async checkUpdates() {
    const fixtures = await this.getFixtures();
    const worldCupFixtures = fixtures.filter(f => f.Competition === 'World Cup');
    
    if (worldCupFixtures.length === 0) {
      console.log('⏳ No World Cup fixtures currently available');
      return;
    }

    const now = Date.now();
    
    for (const fixture of worldCupFixtures) {
      const fixtureId = fixture.FixtureId;
      const startTime = fixture.StartTime || 0;
      
      // Check if match is starting soon or live
      const isLive = startTime <= now && startTime > now - 2 * 60 * 60 * 1000;
      const isSoon = startTime > now && startTime < now + 3 * 60 * 60 * 1000;
      
      if (isLive || isSoon) {
        // Check for score updates
        const scores = await this.getScores(fixtureId);
        const previousCount = this.knownMatches.get(fixtureId) || 0;
        const currentCount = scores ? (Array.isArray(scores) ? scores.length : 0) : 0;
        
        if (currentCount > previousCount && scores) {
          // New score events detected!
          const newEvents = scores.slice(previousCount);
          console.log(`⚡ UPDATE: ${fixture.Participant1} vs ${fixture.Participant2}`);
          console.log(`   📊 ${newEvents.length} new events`);
          console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
          console.log('');
          
          this.eventLog.push({
            fixtureId,
            home: fixture.Participant1,
            away: fixture.Participant2,
            newEvents: newEvents.length,
            timestamp: Date.now()
          });
        }
        
        this.knownMatches.set(fixtureId, currentCount);
      }
    }
  }

  async poll() {
    console.log('🔄 Realtime Monitor Starting...');
    console.log(`📡 Checking every ${this.interval / 1000} seconds`);
    console.log('===============================================\n');

    let iteration = 0;
    
    while (this.running) {
      iteration++;
      console.log(`📊 Check #${iteration} - ${new Date().toLocaleTimeString()}`);
      
      await this.checkUpdates();
      
      // Show stats every 5 checks
      if (iteration % 5 === 0) {
        console.log(`📈 Total events logged: ${this.eventLog.length}`);
      }
      
      console.log(`⏳ Waiting ${this.interval / 1000}s...\n`);
      await this.sleep(this.interval);
    }
  }

  stop() {
    this.running = false;
    console.log('🛑 Monitor stopped');
  }
}

// Run the monitor
const monitor = new RealtimeMonitor();
monitor.poll().catch(console.error);

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  monitor.stop();
  process.exit(0);
});
