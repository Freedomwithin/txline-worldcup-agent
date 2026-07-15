const fs = require('fs');
const path = require('path');
const { MLAgentArena } = require('./ml_agent_arena');

const ARENA_PATH = path.join(__dirname, '../data/arena_state.json');

// Load arena from disk, or create a new one if none exists
function loadArena() {
  try {
    if (fs.existsSync(ARENA_PATH)) {
      const data = fs.readFileSync(ARENA_PATH, 'utf8');
      const state = JSON.parse(data);
      
      // Create a fresh arena and restore state
      const arena = new MLAgentArena();
      arena.restoreFromState(state);
      
      console.log('📂 Arena loaded from disk');
      return arena;
    }
  } catch (error) {
    console.error('Error loading arena state:', error.message);
  }
  
  console.log('🆕 Creating new arena');
  return new MLAgentArena();
}

// Save arena to disk
function saveArena(arena) {
  try {
    const state = arena.getState();
    fs.writeFileSync(ARENA_PATH, JSON.stringify(state, null, 2));
    console.log('💾 Arena saved to disk');
  } catch (error) {
    console.error('Error saving arena state:', error.message);
  }
}

// Arena singleton with persistence
let persistentArena = null;

function getArena() {
  if (!persistentArena) {
    persistentArena = loadArena();
  }
  return persistentArena;
}

function savePersistentArena() {
  if (persistentArena) {
    saveArena(persistentArena);
  }
}

// Reset arena (for testing)
function resetArena() {
  persistentArena = null;
  if (fs.existsSync(ARENA_PATH)) {
    fs.unlinkSync(ARENA_PATH);
  }
  console.log('🔄 Arena reset');
  return getArena();
}

module.exports = { getArena, savePersistentArena, loadArena, saveArena, resetArena };
