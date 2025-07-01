
export interface TokenEvent {
  timestamp: number
  type: "mint" | "burn" | "transfer"
  amount: number
}

export interface LifecycleMetrics {
  totalMinted: number
  totalBurned: number
  totalTransferred: number
  mintBurnRatio: number
}

export class TokenLifecycleTracker {
  private events: TokenEvent[] = []

  add(event: TokenEvent): void {
    this.events.push(event)
  }

  computeMetrics(): LifecycleMetrics {
    let minted = 0
    let burned = 0
    let transferred = 0

    for (const e of this.events) {
      if (e.type === "mint") minted += e.amount
      if (e.type === "burn") burned += e.amount
      if (e.type === "transfer") transferred += e.amount
    }

    const ratio = burned > 0 ? minted / burned : Infinity
    return {
      totalMinted: minted,
      totalBurned: burned,
      totalTransferred: transferred,
      mintBurnRatio: Math.round(ratio * 100) / 100,
    }
  }

  getTimeline(): TokenEvent[] {
    return this.events.slice().sort((a, b) => a.timestamp - b.timestamp)
  }

  reset(): void {
    this.events = []
  }
}

export function summarizeLifecycle(events: TokenEvent[]): LifecycleMetrics {
  const tracker = new TokenLifecycleTracker()
  events.forEach(e => tracker.add(e))
  return tracker.computeMetrics()
}
