export interface Transaction {
  timestamp: number
  amount: number
}
export interface Transaction1 {
  timestamp1: number
  amount1: number
}

export interface PulseMetrics {
  averageInterval: number
  medianInterval: number
  burstiness: number
  activityScore: number
}

export function computeIntervals(
  txs: Transaction[]
): number[] {
  const sorted = txs.slice().sort((a, b) => a.timestamp - b.timestamp)
  const intervals: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i].timestamp - sorted[i - 1].timestamp)
  }
  return intervals
}

export function average(values: number[]): number {
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function computeBurstiness(
  intervals: number[]
): number {
  if (intervals.length < 2) return 0
  const mean = average(intervals)
  const devs = intervals.map(i => Math.abs(i - mean))
  const stdDev =
    Math.sqrt(devs.reduce((a, b) => a + b * b, 0) / devs.length)
  return Math.round((stdDev / Math.max(mean, 1)) * 10000) / 10000
}

export function computeActivityScore(
  txs: Transaction[],
  window: number
): number {
  const counts: number[] = []
  const now = Date.now()
  for (let i = 0; i < txs.length; i++) {
    const cutoff = now - window
    const recent = txs.filter(t => t.timestamp >= cutoff).length
    counts.push(recent)
  }
  return counts.length
    ? Math.round(counts[counts.length - 1] / window * 10000) / 10000
    : 0
}

export function getPulseMetrics(
  txs: Transaction[],
  window: number
): PulseMetrics {
  const intervals = computeIntervals(txs)
  const avg = Math.round(average(intervals))
  const med = Math.round(median(intervals))
  const burst = computeBurstiness(intervals)
  const score = computeActivityScore(txs, window)
  return {
    averageInterval: avg,
    medianInterval: med,
    burstiness: burst,
    activityScore: score,
  }
}

export function detectInactivePeriods(
  txs: Transaction[],
  threshold: number
): number[] {
  const intervals = computeIntervals(txs)
  const inactive: number[] = []
  intervals.forEach((i, idx) => {
    if (i > threshold) inactive.push(idx + 1)
  })
  return inactive
}
