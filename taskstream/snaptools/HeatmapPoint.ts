export interface HeatmapPoint {
  timestamp: number
  activityCount: number
}

export interface HeatmapConfig {
  buckets: number
  normalize: boolean
}

export function generateHeatmap(
  data: HeatmapPoint[],
  config: HeatmapConfig
): number[] {
  const counts = data.map(p => p.activityCount)
  const maxCount = Math.max(...counts, 1)
  const buckets = Math.max(config.buckets, 1)
  const matrix = Array(buckets).fill(0)
  for (const { activityCount } of data) {
    const index = Math.min(
      buckets - 1,
      Math.floor((activityCount / maxCount) * buckets)
    )
    matrix[index]++
  }
  if (!config.normalize) {
    return matrix
  }
  const maxBucket = Math.max(...matrix, 1)
  return matrix.map(v => v / maxBucket)
}

export function bucketTimestamps(
  data: HeatmapPoint[],
  buckets: number
): number[][] {
  const sorted = data.slice().sort((a, b) => a.timestamp - b.timestamp)
  const total = sorted.length
  const size = Math.max(Math.ceil(total / buckets), 1)
  const result: number[][] = []
  for (let i = 0; i < buckets; i++) {
    const slice = sorted.slice(i * size, (i + 1) * size)
    result.push(slice.map(p => p.activityCount))
  }
  return result
}

export function aggregateBuckets(
  matrix: number[][]
): number[] {
  return matrix.map(bucket =>
    bucket.reduce((sum, v) => sum + v, 0)
  )
}

export function smoothHeatmap(
  values: number[],
  windowSize: number
): number[] {
  const result: number[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= windowSize) {
      sum -= values[i - windowSize]
    }
    result.push(sum / Math.min(i + 1, windowSize))
  }
  return result
}
