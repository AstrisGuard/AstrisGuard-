
export interface TransferRecord {
  timestamp: number
  from: string
  to: string
  amount: number
}

export interface WhaleMovement {
  whale: string
  totalMoved: number
  firstSeen: number
  lastSeen: number
  averageAmount: number
}

export function groupByWhale(
  records: TransferRecord[],
  threshold: number
): Record<string, TransferRecord[]> {
  const groups: Record<string, TransferRecord[]> = {}
  for (const r of records) {
    if (r.amount >= threshold) {
      groups[r.from] = groups[r.from] || []
      groups[r.from].push(r)
    }
  }
  return groups
}

export function analyzeWhaleMovements(
  records: TransferRecord[],
  threshold: number
): WhaleMovement[] {
  const groups = groupByWhale(records, threshold)
  const movements: WhaleMovement[] = []
  for (const whale in groups) {
    const recs = groups[whale].sort((a, b) => a.timestamp - b.timestamp)
    const total = recs.reduce((sum, r) => sum + r.amount, 0)
    const avg = Math.round((total / recs.length) * 100) / 100
    const first = recs[0].timestamp
    const last = recs[recs.length - 1].timestamp
    movements.push({ whale, totalMoved: total, firstSeen: first, lastSeen: last, averageAmount: avg })
  }
  return movements
}

export function detectConsecutiveBursts(
  movements: WhaleMovement[],
  intervalMs: number
): WhaleMovement[] {
  return movements.filter(m => m.lastSeen - m.firstSeen <= intervalMs)
}

export function summarizeWhaleMovements(
  movements: WhaleMovement[]
): { totalWhales: number; highestMover: WhaleMovement | null } {
  const total = movements.length
  if (total === 0) return { totalWhales: 0, highestMover: null }
  const highest = movements.reduce((a, b) => (b.totalMoved > a.totalMoved ? b : a))
  return { totalWhales: total, highestMover: highest }
}

export function normalizeMovementAmounts(
  movements: WhaleMovement[]
): WhaleMovement[] {
  const max = Math.max(...movements.map(m => m.totalMoved), 1)
  return movements.map(m => ({
    ...m,
    totalMoved: Math.round((m.totalMoved / max) * 10000) / 10000,
    averageAmount: Math.round((m.averageAmount / max) * 10000) / 10000
  }))
}
