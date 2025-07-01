
export interface TrendSignal {
  timestamp: number
  signal: "Bullish" | "Bearish" | "Neutral"
  confidence: number
}

export class MarketTrendPredictor {
  constructor(private prices: number[], private timestamps: number[]) {}

  predict(window = 5): TrendSignal[] {
    const signals: TrendSignal[] = []

    for (let i = window; i < this.prices.length; i++) {
      const slice = this.prices.slice(i - window, i)
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length
      const curr = this.prices[i]
      const delta = (curr - avg) / avg
      let signal: TrendSignal["signal"] = "Neutral"
      if (delta > 0.02) signal = "Bullish"
      else if (delta < -0.02) signal = "Bearish"
      const confidence = Math.min(Math.abs(delta) * 100, 100)

      signals.push({
        timestamp: this.timestamps[i],
        signal,
        confidence: Math.round(confidence),
      })
    }

    return signals
  }

  topSignals(signals: TrendSignal[], topN = 3): TrendSignal[] {
    return signals
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topN)
  }
}
