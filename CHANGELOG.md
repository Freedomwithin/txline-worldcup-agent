# Changelog

## [0.1.0] - 2026-07-12

### Added
- Initial agent implementation
- Live match monitoring (`live_monitor.js`)
- Match dashboard (`dashboard.js`)
- Pattern analysis (`pattern_analyzer.js`)
- Enhanced agent with match categorization (`enhanced_agent.js`)

### Features
- Fetch World Cup fixtures from TxLINE API
- Categorize matches as Live, Upcoming, or Historic
- Check scores for completed matches
- Analyze team appearances and competition statistics
- Display match start times and status icons

### Technical
- API integration with TxLINE devnet
- JWT and API token authentication
- Support for multiple endpoints:
  - `/fixtures/snapshot` for fixtures
  - `/scores/historical/{fixtureId}` for scores

### Known Issues
- Odds snapshot endpoint returns 404 on devnet
- Scores snapshot endpoint returns 404 on devnet
- Some endpoints may be unavailable on devnet

## [0.0.1] - 2026-07-11

### Added
- Project initialization
- Basic API testing scripts
- Token management utilities
- Environment configuration

### Technical
- Node.js setup
- Axios for API calls
- Dotenv for configuration
- Initial project structure

## [0.2.0] - 2026-07-12

### Added
- **Agent Arena**: Two agents (Momentum vs Contrarian) compete on the same data
- **Realtime Monitor**: Continuous polling with event detection
- **Sharp Movement Detector**: Detects sudden changes in match activity
- **Submission Summary**: Auto-generates hackathon submission checklist
- **Demo Runner**: `run_all.sh` executes all features in sequence

### Enhanced
- Dashboard shows live/upcoming status with icons
- Pattern analysis includes team statistics
- All scripts use consistent authentication

### Fixed
- Sharp detector file creation issue
- API endpoint handling for historical scores

## [0.1.0] - 2026-07-11

### Added
- Initial agent implementation
- Live match monitoring
- Match dashboard
- Pattern analysis
- Enhanced agent with match categorization
