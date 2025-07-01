
export interface VolumeSnapshot {
  timestamp: number
  volume: number
}

export interface SurgeEvent {
  time: number
  previous: number
  current: number
  ratio: number
}

export class TokenSurgeMonitor {
  private history: VolumeSnapshot[] = []

  constructor(private threshold: number) {}

  record(snapshot: VolumeSnapshot): SurgeEvent | null {
    this.history.push(snapshot)
    if (this.history.length < 2) return null

    const prev = this.history[this.history.length - 2]
    const curr = this.history[this.history.length - 1]
    const ratio = prev.volume > 0 ? curr.volume / prev.volume : 0

    if (ratio >= this.threshold) {
      return { time: curr.timestamp, previous: prev.volume, current: curr.volume, ratio }
    }
    return null
  }

  getLastSnapshots(count: number): VolumeSnapshot[] {
    return this.history.slice(-count)
  }

  clearHistory(): void {
    this.history = []
  }

  detectBursts(window: number): SurgeEvent[] {
    const events: SurgeEvent[] = []
    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1]
      const curr = this.history[i]
      const ratio = prev.volume > 0 ? curr.volume / prev.volume : 0
      if (ratio >= this.threshold) {
        events.push({ time: curr.timestamp, previous: prev.volume, current: curr.volume, ratio })
      }
    }
    return events
  }
}

export function analyzeSurgeSeries(
  data: VolumeSnapshot[],
  threshold: number
): SurgeEvent[] {
  const monitor = new TokenSurgeMonitor(threshold)
  return data
    .map(s => monitor.record(s))
    .filter((e): e is SurgeEvent => e !== null)
}
