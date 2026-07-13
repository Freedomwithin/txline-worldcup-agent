const fs = require('fs');
const path = require('path');

const SNAPSHOT_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// In-memory fallback for Vercel (read-only filesystem)
let memoryHistory = { snapshots: [] };
let isVercel = process.env.VERCEL === '1';

function getHistoryPath() {
  // For Vercel, we use memory only
  if (isVercel) {
    return null;
  }
  // For local development, use file system
  return path.join(__dirname, '../data/history.json');
}

function initHistory() {
  try {
    if (isVercel) {
      console.log('📊 Running on Vercel - using memory storage');
      return;
    }
    
    const historyPath = getHistoryPath();
    if (!historyPath) return;
    
    const dir = path.dirname(historyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(historyPath)) {
      fs.writeFileSync(historyPath, JSON.stringify({ snapshots: [] }, null, 2));
      console.log('✅ History file created');
    }
  } catch (error) {
    console.error('Error initializing history:', error.message);
    // Fallback to memory
    memoryHistory = { snapshots: [] };
  }
}

function getHistory() {
  try {
    if (isVercel) {
      return memoryHistory;
    }
    
    const historyPath = getHistoryPath();
    if (!historyPath) return { snapshots: [] };
    
    const data = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading history:', error.message);
    return { snapshots: [] };
  }
}

function saveHistory(history) {
  try {
    if (isVercel) {
      memoryHistory = history;
      return;
    }
    
    const historyPath = getHistoryPath();
    if (!historyPath) return;
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving history:', error.message);
  }
}

function appendSnapshot(agents) {
  try {
    const history = getHistory();
    const last = history.snapshots[history.snapshots.length - 1];
    const now = Date.now();

    if (!last || now - new Date(last.timestamp).getTime() > SNAPSHOT_INTERVAL_MS) {
      history.snapshots.push({
        timestamp: new Date().toISOString(),
        agents: agents.map(a => ({
          name: a.name,
          bankroll: parseFloat(a.bankroll || 0),
          winRate: parseFloat(a.winRate) || 0,
          trades: Number(a.trades || 0)
        }))
      });
      
      if (history.snapshots.length > 100) {
        history.snapshots = history.snapshots.slice(-100);
      }
      
      saveHistory(history);
      console.log('📊 History snapshot saved');
    }
  } catch (error) {
    console.error('Error appending snapshot:', error.message);
  }
}

function handleHistory(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const history = getHistory();
    res.status(200).json({
      success: true,
      data: history,
      count: history.snapshots.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { initHistory, appendSnapshot, getHistory, handleHistory };
