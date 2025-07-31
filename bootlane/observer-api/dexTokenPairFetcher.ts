import fetch from "node-fetch"
import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"
import pino from "pino"

const logger = pino({ name: "fetchTokenPairs" })

export interface TokenPair {
  baseToken: string
  quoteToken: string
  pairAddress: string
  liquidity: number
}

/**
 * Fetch and filter token pairs by liquidity threshold.
 * Retries with exponential backoff on failure.
 */
export async function fetchTokenPairs(
  chain: string,
  liquidityThreshold: number,
  maxRetries = 3,
  backoffMs = 500
): Promise<TokenPair[]> {
  const url = `${DEX_API_BASE}/chains/${encodeURIComponent(chain)}/pairs`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      logger.info(`Requesting pairs (chain=${chain}, attempt=${attempt})`)
      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const raw = (await res.json()) as Array<{
        base: { symbol: string }
        quote: { symbol: string }
        address: string
        liquidity: number
      }>

      const pairs = raw
        .filter((p) => p.liquidity >= liquidityThreshold)
        .map((p) => ({
          baseToken: p.base.symbol,
          quoteToken: p.quote.symbol,
          pairAddress: p.address,
          liquidity: p.liquidity,
        }))

      logger.info(`Fetched ${pairs.length} pairs meeting liquidity>=${liquidityThreshold}`)
      return pairs

    } catch (err: any) {
      clearTimeout(timeout)
      logger.warn(
        { attempt, err: err.message },
        `Attempt ${attempt} failed fetching token pairs`
      )
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, backoffMs * attempt))
      } else {
        logger.error("All retry attempts failed")
      }
    }
  }

  return []
}
