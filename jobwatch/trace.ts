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

/**
 * Group transfer records by whale address (either sender or receiver).
 * @param records - list of transfer events
 * @param minAmount - include only transfers ≥ this amount
 * @param direction - "from" | "to" – which field to group on
 */
export function groupByWhale(
  records: TransferRecord[],
  minAmount: number,
  direction: "from" | "to" = "from"
): Record<string, TransferRecord[]> {
  return records
    .filter(r => r.amount >= minAmount)
    .reduce((acc, record) => {
      const key = record[direction]
      if (!acc[key]) acc[key] = []
      acc[key].push(record)
      return acc
    }, {} as Record<string, TransferRecord[]>)
}

/**
 * Convert grouped records into summarized movements.
 */
export function analyzeWhaleMovements(
  records: TransferRecord[],
  minAmount: number,
  direction: "from" | "to" = "from"
): WhaleMovement[] {
  const groups = groupByWhale(records, minAmount, direction)
  return Object.entries(groups).map(([whale, recs]) => {
    const sorted = recs.slice().sort((a, b) => a.timestamp - b.timestamp)
    const total = sorted.reduce((sum, r) => sum + r.amount, 0)
    const average = total / sorted.length
    return {
      whale,
      totalMoved: total,
      firstSeen: sorted[0].timestamp,
      lastSeen: sorted[sorted.length - 1].timestamp,
      averageAmount: Math.round(average * 100) / 100
    }
  })
}


export function detectConsecutiveBursts(
  movements: WhaleMovement[],
  maxDurationMs: number
): WhaleMovement[] {
  return movements.filter(m => (m.lastSeen - m.firstSeen) <= maxDurationMs)
}

/**
 * Summarize overall whale activity.
 */
export function summarizeWhaleMovements(movements: WhaleMovement[]): {
  totalWhales: number
  highestMover: WhaleMovement | null
} {
  if (movements.length === 0) {
    return { totalWhales: 0, highestMover: null }
  }
  const highest = movements.reduce((prev, curr) =>
    curr.totalMoved > prev.totalMoved ? curr : prev
  )
  return {
    totalWhales: movements.length,
    highestMover: highest
  }
}

/**
 * Normalize total and average amounts to [0,1], preserving precision.
 */
export function normalizeMovementAmounts(
  movements: WhaleMovement[]
): WhaleMovement[] {
  const maxTotal = Math.max(...movements.map(m => m.totalMoved), 1)
  return movements.map(m => ({
    ...m,
    totalMoved: Math.round((m.totalMoved / maxTotal) * 10000) / 10000,
    averageAmount: Math.round((m.averageAmount / maxTotal) * 10000) / 10000
  }))
}
