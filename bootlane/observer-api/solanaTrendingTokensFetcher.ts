import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_RPC_ENDPOINT } from "./dexConfig"

export interface TrendingToken {
  mint: string
  volume24h: number
  uniqueHolders: number
}

export async function fetchTrendingSolanaTokens(
  limit: number
): Promise<TrendingToken[]> {
  const conn = new Connection(SOLANA_RPC_ENDPOINT)
  const accounts = await conn.getProgramAccounts(new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"))
  const metrics = await Promise.all(
    accounts.slice(0, limit).map(async ({ pubkey }) => {
      const info = await conn.getTokenAccountBalance(pubkey)
      return {
        mint: pubkey.toBase58(),
        volume24h: Number(info.value.uiAmount || 0),
        uniqueHolders: 0,
      }
    })
  )
  return metrics
}
