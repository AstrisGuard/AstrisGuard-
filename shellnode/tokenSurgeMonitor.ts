export interface VolumeSnapshot {
  readonly timestamp: number
  readonly volume: number
}

export interface SurgeEvent {
  readonly time: number
  readonly previous: number
  readonly current: number
  readonly ratio: number
}

/**
 * TokenSurgeMonitor detects volume surges based on a ratio threshold.
 * Supports listener registration, max history size, and custom ratio logic.
 */
export class TokenSurgeMonitor {
  private history: VolumeSnapshot[] = []
  private listeners: Array<(event: SurgeEvent) => void> = []
  private maxHistory: number
  private ratioFn: (prev: number, curr: number) => number

  /**
   * @param threshold ratio above which a surge event fires
   * @param options.maxHistory maximum number of snapshots to keep (default 100)
   * @param options.ratioFn custom ratio function
   */
  constructor(
    private threshold: number,
    options: {
      maxHistory?: number
      ratioFn?: (prev: number, curr: number) => number
    } = {}
  ) {
    this.maxHistory = options.maxHistory ?? 100
    this.ratioFn = options.ratioFn ?? ((prev, curr) => (prev > 0 ? curr / prev : 0))
  }

  /**
   * Record a new snapshot.
   * @returns a SurgeEvent if threshold exceeded, otherwise null
   */
  record(snapshot: VolumeSnapshot): SurgeEvent | null {
    // maintain bounded history
    this.history.push(snapshot)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
    if (this.history.length < 2) return null

    const prev = this.history[this.history.length - 2]
    const curr = snapshot
    const ratio = this.ratioFn(prev.volume, curr.volume)

    if (ratio >= this.threshold) {
      const event: SurgeEvent = {
        time: curr.timestamp,
        previous: prev.volume,
        current: curr.volume,
        ratio,
      }
      this.emit(event)
      return event
    }
    return null
  }

  /**
   * Get the last `count` snapshots (up to available).
   */
  getLastSnapshots(count: number): VolumeSnapshot[] {
    return this.history.slice(-count)
  }

  /**
   * Clear all stored history.
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * Detect all bursts in current history.
   */
  detectBursts(): SurgeEvent[] {
    const events: SurgeEvent[] = []
    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1]
      const curr = this.history[i]
      const ratio = this.ratioFn(prev.volume, curr.volume)
      if (ratio >= this.threshold) {
        events.push({
          time: curr.timestamp,
          previous: prev.volume,
          current: curr.volume,
          ratio,
        })
      }
    }
    return events
  }

  /**
   * Register a listener for surge events.
   */
  onSurge(listener: (event: SurgeEvent) => void): void {
    this.listeners.push(listener)
  }

  /**
   * Remove a previously registered listener.
   */
  offSurge(listener: (event: SurgeEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  /** Internal: notify all listeners */
  private emit(event: SurgeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch {
        // ignore listener errors
      }
    }
  }
}

/**
 * Utility to analyze a series of snapshots at once.
 * @param data array of VolumeSnapshot
 * @param threshold ratio threshold
 * @param options see TokenSurgeMonitor constructor
 */
export function analyzeSurgeSeries(
  data: VolumeSnapshot[],
  threshold: number,
  options?: { maxHistory?: number; ratioFn?: (prev: number, curr: number) => number }
): SurgeEvent[] {
  const monitor = new TokenSurgeMonitor(threshold, options)
  return data
    .map(s => monitor.record(s))
    .filter((e): e is SurgeEvent => e !== null)
}
