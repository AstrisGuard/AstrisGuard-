export interface PricePoint {
  timestamp: number
  price: number
}

export interface ActivityPoint {
  timestamp: number
  count: number
}

export type RiskLevel = "Low" | "Medium" | "High"

export function calculateRiskScore(
  priceChange: number,
  liquidity: number,
  flaggedContracts: number
): number {
  const base = Math.abs(priceChange) / Math.max(liquidity, 1)
  const penalty = flaggedContracts * 0.05
  const raw = base + penalty
  return Math.min(Math.round(raw * 100) / 100, 1)
}

export function categorizeRisk(score: number): RiskLevel {
  if (score > 0.75) return "High"
  if (score > 0.4) return "Medium"
  return "Low"
}

export function generateHeatmapMatrix(
  data: ActivityPoint[],
  buckets: number
): number[] {
  const maxCount = Math.max(...data.map(p => p.count), 1)
  const matrix = Array(buckets).fill(0)
  for (const { count } of data) {
    const idx = Math.min(buckets - 1, Math.floor((count / maxCount) * buckets))
    matrix[idx]++
  }
  return matrix
}

export function normalizeArray(values: number[]): number[] {
  const max = Math.max(...values, 1)
  return values.map(v => v / max)
}

export function rollingAverage(values: number[], window: number): number[] {
  const result: number[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= window) sum -= values[i - window]
    result.push(sum / Math.min(i + 1, window))
  }
  return result
}

export function predictBursts(
  volumes: number[],
  threshold: number
): number[] {
  const bursts: number[] = []
  for (let i = 1; i < volumes.length; i++) {
    const change = (volumes[i] - volumes[i - 1]) / Math.max(volumes[i - 1], 1)
    if (change >= threshold) bursts.push(i)
  }
  return bursts
}

export function shannonEntropy(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  let entropy = 0
  for (const key in counts) {
    const p = counts[key] / total
    entropy -= p > 0 ? p * Math.log2(p) : 0
  }
  return Math.round(entropy * 100) / 100
}

export function analyzeTransactionEntropy(addresses: string[]): number {
  const freq: Record<string, number> = {}
  for (const addr of addresses) {
    freq[addr] = (freq[addr] || 0) + 1
  }
  return shannonEntropy(freq)
}

export function calculateVolatility(prices: PricePoint[]): number {
  if (prices.length < 2) return 0
  const changes = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(Math.log(prices[i].price / prices[i - 1].price))
  }
  const mean = changes.reduce((a, b) => a + b, 0) / changes.length
  const variance = changes
    .map(c => (c - mean) ** 2)
    .reduce((a, b) => a + b, 0) / changes.length
  return Math.round(Math.sqrt(variance) * 10000) / 10000
}

export function detectAnomalies(
  values: number[],
  multiplier: number
): number[] {
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const deviations = values.map(v => Math.abs(v - avg))
  const stdDev = Math.sqrt(deviations.reduce((a, b) => a + b * b, 0) / values.length)
  const threshold = avg + stdDev * multiplier
  const anomalies: number[] = []
  values.forEach((v, i) => {
    if (v > threshold) anomalies.push(i)
  })
  return anomalies
}
