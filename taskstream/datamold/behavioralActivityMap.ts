

export interface ActivityRecord {
  address: string
  count: number
  lastActive: number
}

export type BehaviorCategory = "Dormant" | "Occasional" | "Frequent" | "Whale"

export interface AddressBehavior {
  address: string
  category: BehaviorCategory
  score: number
}

export function mapBehavior(
  records: ActivityRecord[]
): AddressBehavior[] {
  const maxCount = Math.max(...records.map(r => r.count), 1)
  const now = Date.now()
  return records.map(r => {
    const normalized = r.count / maxCount
    let category: BehaviorCategory = "Dormant"
    if (normalized > 0.75) category = "Whale"
    else if (normalized > 0.5) category = "Frequent"
    else if (normalized > 0.2) category = "Occasional"
    const age = now - r.lastActive
    const freshness = Math.max(0, 1 - age / (1000 * 60 * 60 * 24))
    const score = Math.round((normalized * 0.7 + freshness * 0.3) * 100) / 100
    return { address: r.address, category, score }
  })
}

export function clusterBehaviors(
  behaviors: AddressBehavior[],
  maxGap: number
): AddressBehavior[][] {
  const sorted = behaviors.sort((a, b) => b.score - a.score)
  const clusters: AddressBehavior[][] = []
  for (const b of sorted) {
    let placed = false
    for (const cluster of clusters) {
      if (Math.abs(cluster[0].score - b.score) <= maxGap) {
        cluster.push(b)
        placed = true
        break
      }
    }
    if (!placed) {
      clusters.push([b])
    }
  }
  return clusters
}

export function summarizeClusters(
  clusters: AddressBehavior[][]
): Record<BehaviorCategory, number> {
  const summary: Record<BehaviorCategory, number> = {
    Dormant: 0,
    Occasional: 0,
    Frequent: 0,
    Whale: 0,
  }
  for (const cluster of clusters) {
    for (const b of cluster) {
      summary[b.category] = (summary[b.category] || 0) + 1
    }
  }
  return summary
}

export function filterByCategory(
  behaviors: AddressBehavior[],
  category: BehaviorCategory
): AddressBehavior[] {
  return behaviors.filter(b => b.category === category)
}

export function rankTopBehaviors(
  behaviors: AddressBehavior[],
  topN: number
): AddressBehavior[] {
  return behaviors
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
