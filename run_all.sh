#!/bin/bash

echo "🚀 TXLINE AGENT DEMO"
echo "====================="
echo ""
echo "1. Running Dashboard..."
echo "-----------------------"
node src/dashboard.js
echo ""
echo "2. Running Pattern Analysis..."
echo "-------------------------------"
node src/pattern_analyzer.js
echo ""
echo "3. Running Agent Arena..."
echo "--------------------------"
node src/agent_arena.js
echo ""
echo "4. Running Sharp Movement Detector..."
echo "-------------------------------------"
node src/sharp_detector.js
echo ""
echo "✅ Demo complete!"
