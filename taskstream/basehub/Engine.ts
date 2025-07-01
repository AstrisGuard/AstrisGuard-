export interface TaskConfig {
  id: string
  type: "riskScore" | "heatmap" | "burstPredict" | "entropy"
  params: Record<string, any>
}

export interface TaskResult {
  taskId: string
  success: boolean
  payload: any
}

export class ExecutionEngine {
  private tasks: TaskConfig[] = []

  registerTask(task: TaskConfig): void {
    this.tasks.push(task)
  }

  async executeAll(): Promise<TaskResult[]> {
    const results: TaskResult[] = []
    for (const t of this.tasks) {
      try {
        const payload = await this.executeTask(t)
        results.push({ taskId: t.id, success: true, payload })
      } catch (err: any) {
        results.push({ taskId: t.id, success: false, payload: { error: err.message } })
      }
    }
    return results
  }

  async executeTask(task: TaskConfig): Promise<any> {
    switch (task.type) {
      case "riskScore":
        return this.runRiskScore(task.params)
      case "heatmap":
        return this.runHeatmap(task.params)
      case "burstPredict":
        return this.runBurstPredict(task.params)
      case "entropy":
        return this.runEntropy(task.params)
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  private async runRiskScore(params: { priceChange: number; liquidity: number; flags: number }) {
    const { calculateRiskScore } = await import("./risk-scoring")
    const score = calculateRiskScore(params.priceChange, params.liquidity, params.flags)
    return { score }
  }

  private async runHeatmap(params: { data: { timestamp: number; count: number }[]; buckets: number }) {
    const { generateHeatmap } = await import("./tokenActivityHeatmap")
    const matrix = generateHeatmap(params.data, { buckets: params.buckets, normalize: true })
    return { matrix }
  }

  private async runBurstPredict(params: { volumes: number[]; threshold: number }) {
    const { detectBursts } = await import("./tokenBurstPredictor")
    const events = detectBursts(params.volumes, { threshold: params.threshold, minInterval: 1, maxInterval: 10 })
    return { events }
  }

  private async runEntropy(params: { addresses: string[] }) {
    const { analyzeTransactionEntropy } = await import("./transactionEntropyAnalyzer")
    const entropy = analyzeTransactionEntropy(params.addresses)
    return { entropy }
  }
}

export function createEngineWithDefaults(): ExecutionEngine {
  const engine = new ExecutionEngine()
  engine.registerTask({ id: "t1", type: "riskScore", params: { priceChange: 5, liquidity: 1000, flags: 2 } })
  engine.registerTask({ id: "t2", type: "heatmap", params: { data: [], buckets: 5 } })
  engine.registerTask({ id: "t3", type: "burstPredict", params: { volumes: [], threshold: 1.5 } })
  return engine
}
