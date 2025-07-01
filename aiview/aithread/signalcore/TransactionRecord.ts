export interface TransactionRecord {
  timestamp: number
  amount: number
  from: string
  to: string
}

export interface TransactionMetrics {
  totalVolume: number
  txCount: number
  averageValue: number
  hourlyRates: Record<number, number>
}

export function processTransactions(
  records: TransactionRecord[],
  intervalMs: number
): TransactionMetrics {
  const totalVolume = records.reduce((sum, r) => sum + r.amount, 0)
  const txCount = records.length
  const averageValue = txCount > 0 ? totalVolume / txCount : 0
  const buckets: Record<number, number> = {}
  records.forEach(r => {
    const bucket = Math.floor(r.timestamp / intervalMs) * intervalMs
    buckets[bucket] = (buckets[bucket] || 0) + 1
  })
  return { totalVolume, txCount, averageValue, hourlyRates: buckets }
}

export function filterByAddress(
  records: TransactionRecord[],
  address: string
): TransactionRecord[] {
  return records.filter(r => r.from === address || r.to === address)
}

export function computeFlowDirection(
  records: TransactionRecord[]
): { address: string; netFlow: number }[] {
  const flow: Record<string, number> = {}
  records.forEach(r => {
    flow[r.from] = (flow[r.from] || 0) - r.amount
    flow[r.to] = (flow[r.to] || 0) + r.amount
  })
  return Object.entries(flow).map(([addr, net]) => ({ address: addr, netFlow: net }))
}
