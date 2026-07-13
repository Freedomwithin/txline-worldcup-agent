// Simple alert system for match events
class AlertSystem {
  constructor() {
    this.alerts = [];
    this.knownMatches = new Map();
  }

  checkForAlerts(matches) {
    const newAlerts = [];
    
    for (const match of matches) {
      const prev = this.knownMatches.get(match.id);
      
      // Match just went live
      if (match.isLive && (!prev || !prev.isLive)) {
        newAlerts.push({
          type: 'LIVE',
          message: `🔴 ${match.home} vs ${match.away} is now LIVE!`,
          match: match
        });
      }
      
      // Score update (if we had scores)
      if (match.eventCount > 0 && (!prev || match.eventCount > prev.eventCount)) {
        newAlerts.push({
          type: 'SCORE',
          message: `⚽ ${match.home} vs ${match.away} - new event!`,
          match: match
        });
      }
      
      this.knownMatches.set(match.id, match);
    }
    
    return newAlerts;
  }
}
