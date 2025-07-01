export interface BurstPredictConfig {
  threshold: number
  minInterval: number
  maxInterval: number
}

export interface BurstEvent {
  index: number
  previousValue: number
  currentValue: number
  changeRatio: number
}

export function detectBursts(
  values: number[],
  config: BurstPredictConfig
): BurstEvent[] {
  const events: BurstEvent[] = []
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1]
    const curr = values[i]
    const ratio = prev > 0 ? curr / prev : Infinity
    if (ratio >= config.threshold) {
      const deltaIndex = i - (events.length ? events[events.length - 1].index : 0)
      if (
        deltaIndex >= config.minInterval &&
        deltaIndex <= config.maxInterval
      ) {
        events.push({ index: i, previousValue: prev, currentValue: curr, changeRatio: ratio })
      }
    }
  }
  return events
}

export function dynamicThreshold(
  history: number[],
  factor: number
): number {
  const avg = history.reduce((sum, v) => sum + v, 0) / history.length
  const deviations = history.map(v => Math.abs(v - avg))
  const stdDev =
    Math.sqrt(deviations.reduce((sum, v) => sum + v * v, 0) / deviations.length)
  return avg + stdDev * factor
}

export function burstSummary(
  bursts: BurstEvent[],
  values: number[]
): {
  totalBursts: number
  highestBurst: BurstEvent | null
  averageRatio: number
} {
  const totalBursts = bursts.length
  if (!totalBursts) {
    return { totalBursts, highestBurst: null, averageRatio: 0 }
  }
  let sumRatio = 0
  let highest: BurstEvent = bursts[0]
  for (const b of bursts) {
    sumRatio += b.changeRatio
    if (b.changeRatio > highest.changeRatio) {
      highest = b
    }
  }
  const averageRatio = sumRatio / totalBursts
  return { totalBursts, highestBurst: highest, averageRatio }
}

export function slidingWindowMax(
  values: number[],
  windowSize: number
): number[] {
  const result: number[] = []
  const deque: number[] = []
  for (let i = 0; i < values.length; i++) {
    while (deque.length && deque[0] <= i - windowSize) {
      deque.shift()
    }
    while (deque.length && values[deque[deque.length - 1]] <= values[i]) {
      deque.pop()
    }
    deque.push(i)
    if (i >= windowSize - 1) {
      result.push(values[deque[0]])
    }
  }
  return result
}

export function mergeBurstEvents(
  listA: BurstEvent[],
  listB: BurstEvent[],
  maxGap: number
): BurstEvent[] {
  const merged: BurstEvent[] = []
  let i = 0
  let j = 0
  while (i < listA.length && j < listB.length) {
    const a = listA[i]
    const b = listB[j]
    if (Math.abs(a.index - b.index) <= maxGap) {
      merged.push({
        index: Math.min(a.index, b.index),
        previousValue: a.previousValue,
        currentValue: b.currentValue,
        changeRatio: Math.max(a.changeRatio, b.changeRatio),
      })
      i++
      j++
    } else if (a.index < b.index) {
      i++
    } else {
      j++
    }
  }
  return merged
}
