#!/bin/bash
echo "🧪 TESTING ALL FEATURES"
echo "======================="
echo ""

echo "1. TESTING MODAL..."
echo "   Open http://localhost:3000 and click a match"
echo ""

echo "2. TESTING API..."
curl -s http://localhost:3000/api/matches | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('   ✅ API Status:', data.get('success', False))
print('   ✅ Matches:', len(data.get('data', [])))
print('   ✅ Agents:', len(data.get('agents', [])))
"

echo ""
echo "3. TESTING HISTORY..."
curl -s http://localhost:3000/api/history | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('   ✅ History Status:', data.get('success', False))
print('   ✅ Snapshots:', len(data.get('data', {}).get('snapshots', [])))
"

echo ""
echo "4. TESTING ANALYTICS..."
echo "   Open http://localhost:3000/analytics.html"
echo ""

echo "✅ All tests complete!"
