import { ZodSchema } from "zod"

export interface ActionContext {
  params: Record<string, any>
  metadata: Record<string, any>
}

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Base class for running actions with validation and error handling.
 */
export abstract class ActionRunner<TInput = any, TOutput = any> {
  abstract schema: ZodSchema<TInput>
  abstract execute(input: TInput, context: ActionContext): Promise<ActionResult<TOutput>>

  /**
   * Runs validation and execution, returning a standardized result.
   */
  async run(rawInput: unknown, context: ActionContext): Promise<ActionResult<TOutput>> {
    const parseResult = this.schema.safeParse(rawInput)
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map(i => `${i.path.join(".")}: ${i.message}`)
      return { success: false, error: `Validation failed: ${issues.join("; ")}` }
    }

    try {
      return await this.execute(parseResult.data, context)
    } catch (err: any) {
      return { success: false, error: err.message || "Execution error" }
    }
  }
}

/**
 * Factory for simple actions based on a Zod schema and executor function.
 */
export function createActionRunner<TI, TO>(
  schema: ZodSchema<TI>,
  executor: (input: TI, ctx: ActionContext) => Promise<ActionResult<TO>>
): ActionRunner<TI, TO> {
  return new (class extends ActionRunner<TI, TO> {
    schema = schema
    execute = executor
  })()
}
