const express = require('express');
const path = require('path');
const apiHandler = require('./api/server.js');

const app = express();
const PORT = process.env.PORT || 3000;

// API routes - all /api/* requests go to the handler
app.use('/api', apiHandler);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// All other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌍 World Cup Agent running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/matches`);
  console.log(`📊 History at http://localhost:${PORT}/api/history`);
});
