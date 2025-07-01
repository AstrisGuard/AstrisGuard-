
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

export function computeAgeHours(launchTimestamp: number): number {
  return Math.floor((Date.now() - launchTimestamp) / (1000 * 60 * 60))
}

export function recentVolume(history: number[], period: number): number {
  const slice = history.slice(-period)
  return slice.reduce((sum, v) => sum + v, 0)
}

export function computeGrowth(history: number[], period: number): number {
  const recent = recentVolume(history, period)
  const prior = history.slice(0, history.length - period).slice(-period)
  const priorSum = prior.reduce((sum, v) => sum + v, 0) || 1
  return Math.round((recent / priorSum) * 10000) / 10000
}

export function identifyEmergingTokens(
  tokens: TokenInfo[],
  minAge: number,
  period: number,
  growthThreshold: number
): EmergingToken[] {
  const emerging: EmergingToken[] = []
  for (const t of tokens) {
    const age = computeAgeHours(t.launchTimestamp)
    if (age >= minAge) {
      const vol = recentVolume(t.volumeHistory, period)
      const growth = computeGrowth(t.volumeHistory, period)
      if (growth >= growthThreshold) {
        emerging.push({ tokenId: t.tokenId, ageHours: age, recentVolume: vol, volumeGrowth: growth })
      }
    }
  }
  return emerging
}

export function rankEmerging(
  list: EmergingToken[],
  topN: number
): EmergingToken[] {
  return list
    .slice()
    .sort((a, b) => b.volumeGrowth - a.volumeGrowth)
    .slice(0, topN)
}

export function normalizeEmergingVolumes(
  list: EmergingToken[]
): EmergingToken[] {
  const maxVol = Math.max(...list.map(e => e.recentVolume), 1)
  return list.map(e => ({
    ...e,
    recentVolume: Math.round((e.recentVolume / maxVol) * 10000) / 10000
  }))
}
