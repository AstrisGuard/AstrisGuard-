
export interface TransferRecord {
  timestamp: number
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

export class TokenFlowAggregator {
  private records: TransferRecord[] = []

  constructor(records?: TransferRecord[]) {
    this.records = records ?? []
  }

  add(record: TransferRecord): void {
    this.records.push(record)
  }

  aggregate(): FlowSummary {
    const inflow: Record<string, number> = {}
    const outflow: Record<string, number> = {}

    for (const r of this.records) {
      outflow[r.from] = (outflow[r.from] || 0) + r.amount
      inflow[r.to] = (inflow[r.to] || 0) + r.amount
    }

    const totalIn = Object.values(inflow).reduce((a, b) => a + b, 0)
    const totalOut = Object.values(outflow).reduce((a, b) => a + b, 0)
    const net = totalIn - totalOut

    const topRecipients = Object.entries(inflow)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr]) => addr)

    const topSenders = Object.entries(outflow)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr]) => addr)

    return { totalIn, totalOut, netFlow: net, topRecipients, topSenders }
  }

  clear(): void {
    this.records = []
  }
}

export function summarizeFlows(records: TransferRecord[]): FlowSummary {
  return new TokenFlowAggregator(records).aggregate()
}
