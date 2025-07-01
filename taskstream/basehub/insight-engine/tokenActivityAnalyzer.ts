export interface ActivityRecord {
  timestamp: number
  volume: number
  transfers: number
}

export interface ActivityMetrics {
  totalVolume: number
  averageTransfers: number
  peakVolume: number
  peakTransfers: number
  movingAverageVolume: number[]
  transferRate: number[]
}

export function computeActivityMetrics(
  records: ActivityRecord[],
  windowSize: number
): ActivityMetrics {
  const volumes = records.map(r => r.volume)
  const transfers = records.map(r => r.transfers)
  const totalVolume = volumes.reduce((a, b) => a + b, 0)
  const averageTransfers =
    transfers.reduce((a, b) => a + b, 0) / Math.max(transfers.length, 1)
  const peakVolume = Math.max(...volumes, 0)
  const peakTransfers = Math.max(...transfers, 0)
  const movingAverageVolume: number[] = []
  for (let i = 0; i < volumes.length; i++) {
    const slice = volumes.slice(Math.max(0, i - windowSize + 1), i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    movingAverageVolume.push(Math.round(avg * 100) / 100)
  }
  const transferRate: number[] = []
  for (let i = 1; i < transfers.length; i++) {
    const rate = transfers[i] / Math.max(transfers[i - 1], 1)
    transferRate.push(Math.round(rate * 1000) / 1000)
  }
  return {
    totalVolume,
    averageTransfers: Math.round(averageTransfers * 100) / 100,
    peakVolume,
    peakTransfers,
    movingAverageVolume,
    transferRate
  }
}

export function detectVolumeSpikes(
  records: ActivityRecord[],
  thresholdRatio: number
): number[] {
  const spikes: number[] = []
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1].volume
    const curr = records[i].volume
    const ratio = prev > 0 ? curr / prev : 0
    if (ratio >= thresholdRatio) {
      spikes.push(i)
    }
  }
  return spikes
}

export function computeTransferCorrelation(
  recordsA: ActivityRecord[],
  recordsB: ActivityRecord[]
): number {
  const len = Math.min(recordsA.length, recordsB.length)
  let sumA = 0
  let sum
