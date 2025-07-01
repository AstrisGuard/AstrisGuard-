
export interface PriceTick {
  timestamp: number
  price: number
}

export interface VolatilityMetrics {
  stdDev: number
  avgTrueRange: number
  historicalVolatility: number
}

export function computeStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.round(Math.sqrt(variance) * 10000) / 10000
}

export function computeATR(data: PriceTick[], period: number): number {
  if (data.length < 2) return 0
  const trs: number[] = []
  for (let i = 1; i < data.length; i++) {
    const high = Math.max(data[i].price, data[i - 1].price)
    const low = Math.min(data[i].price, data[i - 1].price)
    trs.push(high - low)
  }
  const atr = trs
    .slice(-period)
    .reduce((a, b) => a + b, 0) / period
  return Math.round(atr * 10000) / 10000
}

export function computeHistoricalVolatility(
  data: PriceTick[],
  period: number
): number {
  const logReturns: number[] = []
  for (let i = 1; i < data.length; i++) {
    logReturns.push(Math.log(data[i].price / data[i - 1].price))
  }
  return computeStandardDeviation(logReturns) * Math.sqrt(252)
}

export function analyzeVolatility(
  data: PriceTick[],
  atrPeriod: number,
  hvPeriod: number
): VolatilityMetrics {
  const stdDev = computeStandardDeviation(data.map(d => d.price))
  const atr = computeATR(data, atrPeriod)
  const hv = computeHistoricalVolatility(data, hvPeriod)
  return { stdDev, avgTrueRange: atr, historicalVolatility: Math.round(hv * 10000) / 10000 }
}

export function detectVolatilitySpikes(
  metrics: VolatilityMetrics[],
  threshold: number
): number[] {
  return metrics
    .map((m, idx) => (m.historicalVolatility >= threshold ? idx : -1))
    .filter(idx => idx >= 0)
}
