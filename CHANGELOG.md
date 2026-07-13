# Changelog

## [0.3.0] - 2026-07-12

### Added
- **Live Web Dashboard**: Deployed to Vercel at https://txline-worldcup-agent.vercel.app
- **API Endpoint**: `/api/matches` returns real-time World Cup fixture data
- **Environment Variables**: Support for `TXLINE_JWT`, `TXLINE_API_TOKEN`, `TXLINE_API_URL`
- **Local Development**: `vercel dev` for testing locally
- **Auto-refresh**: Dashboard updates every 60 seconds

### Enhanced
- **Error Handling**: Better error messages for missing credentials
- **CORS Support**: API endpoints allow cross-origin requests
- **Logging**: More detailed logs for debugging

### Fixed
- Vercel deployment configuration
- API route handling
- Environment variable loading on production
- 404 errors on API routes

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

## [0.1.0] - 2026-07-11

### Added
- Initial agent implementation
- Live match monitoring
- Match dashboard
- Pattern analysis
- Enhanced agent with match categorization
- TxLINE API integration
- JWT and API token authentication
- Support for `/fixtures/snapshot` and `/scores/historical/{fixtureId}` endpoints

### Technical
- Node.js setup
- Axios for API calls
- Dotenv for configuration
- Project structure
