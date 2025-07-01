

export interface DataPoint {
  timestamp: number
  price: number
  volume: number
}

export interface RewindOptions {
  targetTime: number
  stepCount: number
}

export interface RewindResult {
  points: DataPoint[]
  averagePrice: number
  totalVolume: number
}

export function rewindHistoricalData(
  series: DataPoint[],
  options: RewindOptions
): RewindResult {
  const { targetTime, stepCount } = options
  const sorted = series
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
  const slice = sorted.filter(p => p.timestamp >= targetTime)
  const points = slice.slice(0, stepCount)
  const totalVolume = points.reduce((sum, p) => sum + p.volume, 0)
  const averagePrice =
    points.length > 0
      ? points.reduce((sum, p) => sum + p.price, 0) / points.length
      : 0
  return { points, averagePrice, totalVolume }
}

export function computeBackwardReturns(
  series: DataPoint[],
  lookback: number
): number[] {
  const sorted = series.slice().sort((a, b) => a.timestamp - b.timestamp)
  const returns: number[] = []
  for (let i = lookback; i < sorted.length; i++) {
    const prev = sorted[i - lookback].price
    const curr = sorted[i].price
    const ret = prev > 0 ? (curr - prev) / prev : 0
    returns.push(Math.round(ret * 1e6) / 1e6)
  }
  return returns
}

export function findMaxDrawdown(
  series: DataPoint[]
): { peak: number; trough: number; drawdown: number } {
  let peak = series[0]?.price || 0
  let trough = peak
  let maxDD = 0
  for (const p of series) {
    if (p.price > peak) {
      peak = p.price
      trough = p.price
    } else if (p.price < trough) {
      trough = p.price
      const dd = (peak - trough) / peak
      if (dd > maxDD) maxDD = dd
    }
  }
  return { peak, trough, drawdown: Math.round(maxDD * 1e6) / 1e6 }
}

export function slidingRewindAnalysis(
  series: DataPoint[],
  window: number
): RewindResult[] {
  const results: RewindResult[] = []
  const sorted = series.slice().sort((a, b) => a.timestamp - b.timestamp)
  for (let i = window; i <= sorted.length; i++) {
    const slice = sorted.slice(i - window, i)
    const averagePrice =
      slice.reduce((sum, p) => sum + p.price, 0) / slice.length
    const totalVolume = slice.reduce((sum, p) => sum + p.volume, 0)
    results.push({ points: slice, averagePrice, totalVolume })
  }
  return results
}

export function normalizeData(
  series: DataPoint[]
): DataPoint[] {
  const maxPrice = Math.max(...series.map(p => p.price), 1)
  const maxVol = Math.max(...series.map(p => p.volume), 1)
  return series.map(p => ({
    timestamp: p.timestamp,
    price: Math.round((p.price / maxPrice) * 1e6) / 1e6,
    volume: Math.round((p.volume / maxVol) * 1e6) / 1e6,
  }))
}
