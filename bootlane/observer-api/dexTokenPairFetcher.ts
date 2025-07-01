
import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"

export interface TokenPair {
  baseToken: string
  quoteToken: string
  pairAddress: string
}

export async function fetchTokenPairs(
  chain: string,
  liquidityThreshold: number
): Promise<TokenPair[]> {
  const url = `${DEX_API_BASE}/chains/${chain}/pairs`
  let attempt = 0
  while (attempt < 3) {
    try {
      const ctrl = new AbortController()
      const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
      const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: ctrl.signal })
      clearTimeout(id)
      if (!res.ok) throw new Error("Fetch error")
      const data = (await res.json()) as any[]
      return data
        .filter(p => p.liquidity >= liquidityThreshold)
        .map(p => ({
          baseToken: p.base.symbol,
          quoteToken: p.quote.symbol,
          pairAddress: p.address,
        }))
    } catch {
      attempt++
    }
  }
  return []
}
