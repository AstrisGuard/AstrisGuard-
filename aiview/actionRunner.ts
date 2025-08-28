import { ZodSchema, ZodError } from "zod"

// ------------ Types ------------

export interface ActionContext {
  params: Record<string, unknown>
  metadata: Record<string, unknown>
}

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  issues?: string[]            // populated on validation errors
  traceId?: string             // correlation id for this run
  durationMs?: number          // execution time
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>, ...rest: unknown[]): void
  debug(message: string, meta?: Record<string, unknown>, ...rest: unknown[]): void
  warn(message: string, meta?: Record<string, unknown>, ...rest: unknown[]): void
  error(message: string, meta?: Record<string, unknown>, ...rest: unknown[]): void
  child?(context: Record<string, unknown>): Logger
}

class ConsoleLogger implements Logger {
  private context: Record<string, unknown>
  constructor(context: Record<string, unknown> = {}) {
    this.context = context
  }
  private line(level: "info" | "debug" | "warn" | "error", message: string, meta?: Record<string, unknown>, ...rest: unknown[]) {
    const entry = {
      level,
      time: new Date().toISOString(),
      msg: message,
      meta: { ...(this.context || {}), ...(meta || {}) },
    }
    const text = JSON.stringify(entry)
    switch (level) {
      case "debug": return console.debug(text, ...rest)
      case "info": return console.info(text, ...rest)
      case "warn": return console.warn(text, ...rest)
      case "error": return console.error(text, ...rest)
    }
  }
  info(m: string, meta?: Record<string, unknown>, ...r: unknown[]) { this.line("info", m, meta, ...r) }
  debug(m: string, meta?: Record<string, unknown>, ...r: unknown[]) { this.line("debug", m, meta, ...r) }
  warn(m: string, meta?: Record<string, unknown>, ...r: unknown[]) { this.line("warn", m, meta, ...r) }
  error(m: string, meta?: Record<string, unknown>, ...r: unknown[]) { this.line("error", m, meta, ...r) }
  child(context: Record<string, unknown>): Logger { return new ConsoleLogger({ ...(this.context || {}), ...(context || {}) }) }
}

export class ActionError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = "ActionError"
  }
}

export interface ActionRunnerOptions {
  name?: string
  logger?: Logger
  timeoutMs?: number                 // optional per-run timeout
  retries?: number                   // retry on ActionError with code="RETRYABLE"
  retryBackoffMs?: number            // deterministic linear backoff
  hooks?: {
    onBefore?: (traceId: string, input: unknown, ctx: ActionContext) => void
    onAfter?: (traceId: string, result: ActionResult<unknown>, ctx: ActionContext) => void
  }
}

// ------------ Base class ------------

let __seq = 0
function nextTraceId(): string {
  __seq += 1
  return `${Date.now().toString(36)}-${__seq.toString(36)}`
}

/**
 * Base class for running actions with validation, timeout, retries, and structured logging.
 */
export abstract class ActionRunner<TInput = unknown, TOutput = unknown> {
  abstract schema: ZodSchema<TInput>
  abstract execute(input: TInput, context: ActionContext): Promise<ActionResult<TOutput>>

  protected readonly name: string
  protected readonly logger: Logger
  protected readonly timeoutMs?: number
  protected readonly retries: number
  protected readonly retryBackoffMs: number
  protected readonly hooks?: ActionRunnerOptions["hooks"]

  constructor(opts: ActionRunnerOptions = {}) {
    this.name = opts.name ?? this.constructor.name ?? "ActionRunner"
    const baseLogger = opts.logger ?? new ConsoleLogger()
    this.logger = baseLogger.child ? baseLogger.child({ action: this.name }) : baseLogger
    this.timeoutMs = opts.timeoutMs
    this.retries = Number.isInteger(opts.retries) ? (opts.retries as number) : 0
    this.retryBackoffMs = typeof opts.retryBackoffMs === "number" ? opts.retryBackoffMs as number : 0
    this.hooks = opts.hooks
  }

  /**
   * Validate, execute with optional timeout and deterministic retries, and return a standardized result.
   */
  async run(rawInput: unknown, context: ActionContext): Promise<ActionResult<TOutput>> {
    const traceId = nextTraceId()
    const started = Date.now()

    // Validation
    const parsed = this.schema.safeParse(rawInput)
    if (!parsed.success) {
      const issues = flattenZodIssues(parsed.error)
      const result: ActionResult<TOutput> = {
        success: false,
        error: "Validation failed",
        issues,
        traceId,
        durationMs: Date.now() - started,
      }
      this.logger.warn("validation_failed", { traceId, issues })
      this.hooks?.onAfter?.(traceId, result, context)
      return result
    }

    const input = parsed.data
    this.logger.info("start", { traceId })
    this.hooks?.onBefore?.(traceId, input, context)

    const runOnce = async (): Promise<ActionResult<TOutput>> => {
      const execPromise = this.execute(input, context)
      const result = await (this.timeoutMs ? withTimeout(execPromise, this.timeoutMs) : execPromise)
      return result
    }

    try {
      let attempt = 0
      // first attempt + (retries) additional attempts on RETRYABLE errors
      while (true) {
        try {
          const result = await runOnce()
          const durationMs = Date.now() - started
          const final: ActionResult<TOutput> = { ...result, traceId, durationMs }
          this.logger.info("end", { traceId, durationMs, success: !!result.success })
          this.hooks?.onAfter?.(traceId, final, context)
          return final
        } catch (err: any) {
          attempt += 1
          const isRetryable = err instanceof ActionError && err.code === "RETRYABLE"
          if (isRetryable && attempt <= this.retries) {
            const backoff = this.retryBackoffMs * attempt // deterministic linear backoff
            this.logger.warn("retrying", { traceId, attempt, backoff })
            if (backoff > 0) await delay(backoff)
            continue
          }
          throw err
        }
      }
    } catch (err: any) {
      const message =
        err?.name === "TimeoutError"
          ? `Execution timed out after ${this.timeoutMs}ms`
          : err?.message || "Execution error"

      const durationMs = Date.now() - started
      const result: ActionResult<TOutput> = {
        success: false,
        error: message,
        traceId,
        durationMs,
      }
      this.logger.error("error", {
        traceId,
        durationMs,
        name: err?.name,
        code: err?.code,
        message,
      })
      this.hooks?.onAfter?.(traceId, result, context)
      return result
    }
  }
}

// ------------ Factory ------------

export function createActionRunner<TI, TO>(
  schema: ZodSchema<TI>,
  executor: (input: TI, ctx: ActionContext) => Promise<ActionResult<TO>>,
  opts: ActionRunnerOptions = {}
): ActionRunner<TI, TO> {
  return new (class extends ActionRunner<TI, TO> {
    schema = schema
    constructor() { super({ name: opts.name ?? "InlineAction", ...opts }) }
    execute = executor
  })()
}

// ------------ helpers ------------

function flattenZodIssues(error: ZodError): string[] {
  return error.issues.map((i) => {
    const path = i.path?.length ? i.path.join(".") : "(root)"
    return `${path}: ${i.message}`
  })
}

function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const e: any = new Error("Timeout")
      e.name = "TimeoutError"
      reject(e)
    }, timeoutMs)
  })
  return Promise.race([p.finally(() => clearTimeout(timer!)), timeout])
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
