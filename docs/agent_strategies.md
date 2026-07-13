# Agent Trading Strategies

## ML Prophet (ML Pattern Detection)

**Signal**: Momentum score based on recent match activity
**Calculation**: 
- Momentum = (last_activity - first_activity) / first_activity
- Confidence = min(0.95, 0.5 + abs(momentum) * 2)

**Threshold**: Buy when momentum > 0.1, Sell when momentum < -0.1

## Sentinel AI (ML + Market Sentiment)

**Signal**: Combination of momentum and volatility
**Calculation**:
- Volatility = standard deviation of last 5 activity values
- Score = (momentum * 0.6) + (volatility * 0.4)

**Threshold**: Buy when score > 0.15, Sell when score < -0.15

## Simple Momentum (Baseline)

**Signal**: Simple trend following
**Calculation**: Compare current activity to 5-step moving average
**Threshold**: Buy when current > moving average by 5%, Sell when below by 5%
