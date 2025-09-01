// ---------------------------
// Constants & configuration
// ---------------------------

/** Base URL for Dexscreener API */
export const DEX_API_BASE = "https://api.dexscreener.com"

/** Default Solana RPC endpoint */
export const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"

/** Common request headers */
export const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
}

/** Network request timeout (ms) */
export const FETCH_TIMEOUT_MS = 15_000

/** Maximum retry attempts for failed requests */
export const MAX_RETRIES = 3

/** Supported chain identifiers */
export type DexChain = "solana" | "ethereum" | "polygon"
                                                        
