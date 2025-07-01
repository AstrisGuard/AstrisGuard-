
export interface ActionContext {
  params: Record<string, any>
  metadata: Record<string, any>
}

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export abstract class ActionRunner<TInput = any, TOutput = any> {
  abstract validate(input: unknown): input is TInput
  abstract execute(input: TInput, context: ActionContext): Promise<ActionResult<TOutput>>
  async run(rawInput: unknown, context: ActionContext): Promise<ActionResult<TOutput>> {
    if (!this.validate(rawInput)) {
      return { success: false, error: 'Invalid input' }
    }
    try {
      const result = await this.execute(rawInput, context)
      return result
    } catch (err: any) {
      return { success: false, error: err.message || 'Execution error' }
    }
  }
}

export function createActionRunner<TI, TO>(
  validator: (x: unknown) => x is TI,
  executor: (input: TI, ctx: ActionContext) => Promise<ActionResult<TO>>
): ActionRunner<TI, TO> {
  return new (class extends ActionRunner<TI, TO> {
    validate = validator
    execute = executor
  })()
}
