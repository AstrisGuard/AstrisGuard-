import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"

export interface TokenData {
  symbol: string
  priceUsd: number
  volume24h: number
  liquidity: number
}

export async function retrieveTokenData(
  pairAddress: string
): Promise<TokenData | null> {
  const url = `${DEX_API_BASE}/pair/${pairAddress}`
  try {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: ctrl.signal })
    clearTimeout(id)
    if (!res.ok) return null
    const json = await res.json()
    return {
      symbol: json.token0.symbol,
      priceUsd: json.priceUsd,
      volume24h: json.volumeUsd24h,
      liquidity: json.liquidity,
    }
  } catch {
    return null
  }
}
