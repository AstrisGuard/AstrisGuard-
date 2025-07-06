export interface TransferRecord {
  timestamp: number  // Unix timestamp (ms)
  from: string
  to: string
  amount: number
}

export interface FlowSummary {
  totalIn: number
  totalOut: number
  netFlow: number
  topRecipients: string[]
  topSenders: string[]
}

interface AggregationOptions {
  addressFilter?: string          // Filter flows involving this address
  timeWindowMs?: number           // Only include transfers from the last X ms
  currentTime?: number            // Custom 'now' for time filtering
}

export class TokenFlowAggregator {
  private records: TransferRecord[]

  constructor(records?: TransferRecord[]) {
    this.records = records ?? []
  }

  add(record: TransferRecord): void {
    this.records.push(record)
  }

  aggregate(options: AggregationOptions = {}): FlowSummary {
    const { addressFilter, timeWindowMs, currentTime = Date.now() } = options

    const inflow: Record<string, number> = {}
    const outflow: Record<string, number> = {}

    for (const r of this.records) {
      const isRecent = !timeWindowMs || r.timestamp >= currentTime - timeWindowMs
      const involvesAddress = !addressFilter || r.from === addressFilter || r.to === addressFilter

      if (isRecent && involvesAddress) {
        outflow[r.from] = (outflow[r.from] || 0) + r.amount
        inflow[r.to] = (inflow[r.to] || 0) + r.amount
      }
    }

    const totalIn = Object.values(inflow).reduce((a, b) => a + b, 0)
    const totalOut = Object.values(outflow).reduce((a, b) => a + b, 0)
    const netFlow = totalIn - totalOut

    const topRecipients = Object.entries(inflow)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr]) => addr)

    const topSenders = Object.entries(outflow)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr]) => addr)

    return { totalIn, totalOut, netFlow, topRecipients, topSenders }
  }

  clear(): void {
    this.records = []
  }
}

export function summarizeFlows(
  records: TransferRecord[],
  options?: AggregationOptions
): FlowSummary {
  return new TokenFlowAggregator(records).aggregate(options)
}
