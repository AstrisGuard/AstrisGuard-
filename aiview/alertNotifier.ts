
export type AlertLevel = 'info' | 'warning' | 'critical'

export interface AlertPayload {
  title: string
  message: string
  level: AlertLevel
  timestamp: number
  details?: Record<string, any>
}

export interface AlertService {
  send(alert: AlertPayload): Promise<void>
}

export class ConsoleAlertService implements AlertService {
  async send(alert: AlertPayload): Promise<void> {
    const line = `[${new Date(alert.timestamp).toISOString()}] ${alert.level.toUpperCase()} ${alert.title}: ${alert.message}`
    console.log(line)
    if (alert.details) {
      console.log(JSON.stringify(alert.details))
    }
  }
}

export class AggregatingAlertService implements AlertService {
  private buffer: AlertPayload[] = []
  async send(alert: AlertPayload): Promise<void> {
    this.buffer.push(alert)
    if (this.buffer.length >= 5) {
      await this.flush()
    }
  }
  async flush(): Promise<void> {
    for (const a of this.buffer) {
      console.log(`FLUSH ${a.level} ${a.title}`)
    }
    this.buffer = []
  }
}
