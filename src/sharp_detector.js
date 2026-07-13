const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SharpMovementDetector {
  constructor() {
    this.jwt = fs.readFileSync(path.join(__dirname, '../.jwt'), 'utf8').trim();
    this.apiToken = fs.readFileSync(path.join(__dirname, '../.apitoken'), 'utf8').trim();
    this.baseUrl = 'https://txline-dev.txodds.com/api';
    this.history = {};
    this.signals = [];
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

  // Sharp movement detection: look for sudden changes in match activity
  detectSharpMovement(fixture, scores) {
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return null;
    }

    const fixtureId = fixture.FixtureId;
    const previousCount = this.history[fixtureId] || 0;
    const currentCount = scores.length;

    // If we have more scores than before, there's activity
    if (currentCount > previousCount) {
      const newEvents = scores.slice(previousCount);
      this.history[fixtureId] = currentCount;

      return {
        fixtureId: fixtureId,
        home: fixture.Participant1,
        away: fixture.Participant2,
        newEvents: newEvents.length,
        timestamp: Date.now(),
        intensity: Math.min(1, newEvents.length / 5) // 0-1 scale
      };
    }

    this.history[fixtureId] = currentCount;
    return null;
  }

  async run() {
    console.log('⚡ Sharp Movement Detector');
    console.log('==========================\n');

    const fixtures = await this.getFixtures();
    console.log('📊 Monitoring ' + fixtures.length + ' fixtures...\n');

    // First pass: initialize history
    for (const fixture of fixtures) {
      const scores = await this.getScores(fixture.FixtureId);
      if (scores && Array.isArray(scores)) {
        this.history[fixture.FixtureId] = scores.length;
      }
    }

    console.log('✅ History initialized (' + Object.keys(this.history).length + ' fixtures tracked)\n');

    // Run detection
    for (const fixture of fixtures) {
      const scores = await this.getScores(fixture.FixtureId);
      const signal = this.detectSharpMovement(fixture, scores);
      
      if (signal) {
        console.log('⚡ SHARP MOVEMENT DETECTED!');
        console.log('   ' + signal.home + ' vs ' + signal.away);
        console.log('   New events: ' + signal.newEvents);
        console.log('   Intensity: ' + (signal.intensity * 100).toFixed(0) + '%');
        console.log('');
        this.signals.push(signal);
      }
    }

    if (this.signals.length === 0) {
      console.log('📊 No sharp movements detected (matches may not have started yet)');
    }

    console.log('📊 Summary:');
    console.log('   Total signals detected: ' + this.signals.length);
  }
}

// Run the detector
const detector = new SharpMovementDetector();
detector.run().catch(console.error);
