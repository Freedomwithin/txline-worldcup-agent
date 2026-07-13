const express = require('express');
const path = require('path');
const apiHandler = require('./api/server.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/matches', apiHandler);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌍 World Cup Agent running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/matches`);
});
