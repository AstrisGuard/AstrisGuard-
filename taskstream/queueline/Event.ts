export interface LiquidityPoint {
  timestamp: number
  liquidity: number
}

export interface StressEvent {
  start: number
  end: number
  maxDrop: number
  severity: "Low" | "Medium" | "High"
}

export interface StressReport {
  totalEvents: number
  events: StressEvent[]
  overallSeverity: "Low" | "Medium" | "High"
}

export function computeLiquidityDrops(
  data: LiquidityPoint[],
  windowSize: number
): StressEvent[] {
  const events: StressEvent[] = []
  for (let i = 0; i <= data.length - windowSize; i++) {
    const slice = data.slice(i, i + windowSize)
    const startLevel = slice[0].liquidity
    const endLevel = slice[slice.length - 1].liquidity
    const drop = (startLevel - endLevel) / Math.max(startLevel, 1)
    if (drop > 0) {
      const severity = drop > 0.3 ? "High" : drop > 0.15 ? "Medium" : "Low"
      events.push({
        start: slice[0].timestamp,
        end: slice[slice.length - 1].timestamp,
        maxDrop: Math.round(drop * 10000) / 10000,
        severity,
      })
    }
  }
  return events
}

export function mergeStressEvents(
  events: StressEvent[],
  maxGap: number
): StressEvent[] {
  if (!events.length) return []
  const sorted = events.sort((a, b) => a.start - b.start)
  const merged: StressEvent[] = []
  let current = { ...sorted[0] }
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    if (next.start - current.end <= maxGap) {
      current.end = next.end
      current.maxDrop = Math.max(current.maxDrop, next.maxDrop)
      current.severity =
        current.maxDrop > 0.3
          ? "High"
          : current.maxDrop > 0.15
          ? "Medium"
          : "Low"
    } else {
      merged.push(current)
      current = { ...next }
    }
  }
  merged.push(current)
  return merged
}

export function generateStressReport(
  data: LiquidityPoint[],
  windowSize: number,
  mergeGap: number
): StressReport {
  const drops = computeLiquidityDrops(data, windowSize)
  const events = mergeStressEvents(drops, mergeGap)
  const total = events.length
  const severityScores = events.map(e =>
    e.severity === "High" ? 2 : e.severity === "Medium" ? 1 : 0
  )
  const avgScore =
    total > 0
      ? severityScores.reduce((a, b) => a + b, 0) / total
      : 0
  const overallSeverity =
    avgScore > 1.5 ? "High" : avgScore > 0.75 ? "Medium" : "Low"
  return { totalEvents: total, events, overallSeverity }
}

export function normalizeLiquidity(data: LiquidityPoint[]): number[] {
  const values = data.map(p => p.liquidity)
  const max = Math.max(...values, 1)
  return values.map(v => v / max)
}
