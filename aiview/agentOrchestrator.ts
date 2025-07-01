
import { ActionRunner, ActionContext, ActionResult } from './actionRunner'

export type Task<TO> = {
  id: string
  runner: ActionRunner<any, TO>
  input: unknown
}

export class AgentOrchestrator {
  private tasks: Task<any>[] = []
  addTask<TO>(id: string, runner: ActionRunner<any, TO>, input: unknown): void {
    this.tasks.push({ id, runner, input })
  }
  async executeAll(): Promise<Record<string, ActionResult>> {
    const results: Record<string, ActionResult> = {}
    for (const task of this.tasks) {
      const ctx: ActionContext = { params: {}, metadata: {} }
      const res = await task.runner.run(task.input, ctx)
      results[task.id] = res
    }
    return results
  }
  clear(): void {
    this.tasks = []
  }
}
