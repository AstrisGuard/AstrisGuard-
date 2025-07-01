export interface VolumePoint {
  timestamp: number
  volume: number
}

export interface SurgeTrace {
  index: number
  timestamp: number
  changeRatio: number
}

export interface SurgeSummary {
  totalSurges: number
  traces: SurgeTrace[]
  peakSurge: SurgeTrace | null
}

export function computeVolumeChanges(
  data: VolumePoint[]
): number[] {
  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].volume
    const curr = data[i].volume
    const ratio = prev > 0 ? curr / prev : Infinity
    changes.push(Math.round(ratio * 10000) / 10000)
  }
  return changes
}

export function detectSurges(
  data: VolumePoint[],
  threshold: number
): SurgeTrace[] {
  const changes = computeVolumeChanges(data)
  const traces: SurgeTrace[] = []
  for (let i = 0; i < changes.length; i++) {
    if (changes[i] >= threshold) {
      traces.push({
        index: i + 1,
        timestamp: data[i + 1].timestamp,
        changeRatio: changes[i],
      })
    }
  }
  return traces
}

export function summarizeSurges(
  data: VolumePoint[],
  threshold: number
): SurgeSummary {
  const traces = detectSurges(data, threshold)
  if (!traces.length) {
    return { totalSurges: 0, traces: [], peakSurge: null }
  }
  const peak = traces.reduce((prev, curr) =>
    curr.changeRatio > prev.changeRatio ? curr : prev
  )
  return { totalSurges: traces.length, traces, peakSurge: peak }
}

export function slidingWindowAverage(
  data: VolumePoint[],
  window: number
): SurgeTrace[] {
  const result: SurgeTrace[] = []
  for (let i = window; i < data.length; i++) {
    const slice = data.slice(i - window, i)
    const avg = slice.reduce((sum, p) => sum + p.volume, 0) / window
    const ratio = Math.round((data[i].volume / Math.max(avg, 1)) * 10000) / 10000
    result.push({ index: i, timestamp: data[i].timestamp, changeRatio: ratio })
  }
  return result
}

export function mergeSurgeTraces(
  a: SurgeTrace[],
  b: SurgeTrace[],
  maxGap: number
): SurgeTrace[] {
  const merged: SurgeTrace[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    const ai = a[i]
    const bj = b[j]
    if (Math.abs(ai.index - bj.index) <= maxGap) {
      merged.push({
        index: Math.min(ai.index, bj.index),
        timestamp: Math.min(ai.timestamp, bj.timestamp),
        changeRatio: Math.max(ai.changeRatio, bj.changeRatio),
      })
      i++
      j++
    } else if (ai.index < bj.index) {
      i++
    } else {
      j++
    }
  }
  return merged
}

export function normalizeVolumes(data: VolumePoint[]): number[] {
  const vols = data.map(p => p.volume)
  const max = Math.max(...vols, 1)
  return vols.map(v => Math.round((v / max) * 10000) / 10000)
}
