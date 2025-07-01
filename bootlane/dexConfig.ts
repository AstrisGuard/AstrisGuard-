
export const DEX_API_BASE = "https://api.dexscreener.com"
export const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
}
export const FETCH_TIMEOUT_MS = 15000
export const MAX_RETRIES = 3
export type DexChain = "solana" | "ethereum" | "polygon"
