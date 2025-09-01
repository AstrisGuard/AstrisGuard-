export interface TokenInfo {
  tokenId: string
  launchTimestamp: number
  volumeHistory: number[]
}

export interface EmergingToken {
  tokenId: string
  ageHours: number
  recentVolume: number
  volumeGrowth: number
}

/** Safe age in whole hours (never negative) */
export function computeAgeHours(launchTimestamp: number): number {
  const ms = Date.now() - launchTimestamp
  return Math.floor(Math.max(0, ms) / (1000 * 60 * 60))
}

/** Sum of the last `period` volumes (auto-clamped to available history) */
export function recentVolume(history: number[], period: number): number {
  const p = clampPeriod(history, period)
  if (p === 0) return 0
  const slice = history.slice(-p)
  return sum(slice)
}

/**
 * Growth = recent_sum / prior_sum over the same `period`
 * - If there is no prior window or its sum is 0, returns a large finite number (1_000_000) when recent>0, else 0
 * - Period auto-clamped to available history
 */
export function computeGrowth(history: number[], period: number): number {
  const p = clampPeriod(history, period)
  if (p === 0) return 0

  const recent = sum(history.slice(-p))
  const priorWindow = history.slice(0, history.length - p)
  const prior = priorWindow.slice(-p)
  const priorSum = sum(prior)

  if (prior.length === 0 || priorSum === 0) {
    return recent > 0 ? 1_000_000 : 0
  }
  const ratio = recent / priorSum
  return round4(ratio)
}

/**
 * Identify emerging tokens meeting basic data and growth constraints
 * - Skips tokens with insufficient history (< period)
 * - Skips tokens younger than `minAge` hours
 */
export function identifyEmergingTokens(
  tokens: TokenInfo[],
  minAge: number,
  period: number,
  growthThreshold: number
): EmergingToken[] {
  const res: EmergingToken[] = []
  for (const t of tokens) {
    const age = computeAgeHours(t.launchTimestamp)
    if (age < minAge) continue
    if (!Array.isArray(t.volumeHistory) || t.volumeHistory.length < Math.max(1, period)) continue

    const vol = recentVolume(t.volumeHistory, period)
    const growth = computeGrowth(t.volumeHistory, period)
    if (growth >= growthThreshold) {
      res.push({ tokenId: t.tokenId, ageHours: age, recentVolume: vol, volumeGrowth: growth })
    }
  }
  return res
}

/**
 * Rank by highest growth, then by recent volume (desc), then by age (asc = newer first)
 * Deterministic and stable over equal keys
 */
export function rankEmerging(list: EmergingToken[], topN: number): EmergingToken[] {
  const n = Math.max(0, Math.floor(topN))
  return list
    .slice()
    .sort((a, b) => {
      if (b.volumeGrowth !== a.volumeGrowth) return b.volumeGrowth - a.volumeGrowth
      if (b.recentVolume !== a.recentVolume) return b.recentVolume - a.recentVolume
      return a.ageHours - b.ageHours
    })
    .slice(0, n)
}

/**
 * Normalize recentVolume to [0,1] by dividing by max volume in list
 * Returns a new array, original objects are not mutated
 */
export function normalizeEmergingVolumes(list: EmergingToken[]): EmergingToken[] {
  if (list.length === 0) return []
  const maxVol = Math.max(...list.map(e => e.recentVolume), 1)
  return list.map(e => ({
    ...e,
    recentVolume: round4(e.recentVolume / maxVol),
  }))
}

/* ------------ helpers ------------ */

function clampPeriod(history: number[], period: number): number {
  const len = Array.isArray(history) ? history.length : 0
  const p = Math.max(0, Math.floor(period))
  return Math.min(p, len)
}

function sum(arr: number[]): number {
  let s = 0
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    s += Number.isFinite(v) ? v : 0
  }
  return s
}

function round4(n: number): number {
  return Math.round(n * 1e4) / 1e4
}
