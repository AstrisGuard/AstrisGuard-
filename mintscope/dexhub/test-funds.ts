import { Wallet } from "@solana/solana-sdk"
import { z } from "zod"
import type { RequestFaucetFundsArgumentsType, RequestFaucetFundsActionResultType } from "./types"

const FaucetParamsSchema = z.object({
  assetId: z.string().optional(),
  retryCount: z.number().int().min(0).max(5).default(0),
  timeoutMs: z.number().int().min(1000).default(30000),
})

export async function acquireTestFunds(
  wallet: Wallet,
  rawParams: unknown
): Promise<RequestFaucetFundsActionResultType> {
  const parsed = FaucetParamsSchema.safeParse(rawParams)
  if (!parsed.success) {
    return {
      message: `Invalid parameters: ${parsed.error.issues.map(i => i.message).join("; ")}`,
      body: null,
      errorCode: "INVALID_PARAMS",
    }
  }

  const { assetId, retryCount, timeoutMs } = parsed.data
  const token = assetId || "SOL"

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const tx = await wallet.faucet(assetId || undefined)
      const confirmation = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
      ])

      const link = typeof confirmation.getTransactionLink === "function"
        ? confirmation.getTransactionLink()
        : "No link available"

      return {
        message: `Test tokens for ${token} received: ${link}`,
        body: { transactionLink: link },
        errorCode: null,
      }
    } catch (error: any) {
      if (attempt === retryCount) {
        const msg = typeof error === "string" ? error : error?.message || "Unknown error"
        return {
          message: `Faucet request failed for ${token}: ${msg}`,
          body: null,
          errorCode: "FAUCET_ERROR",
        }
      }
    }
  }

  return {
    message: `Unable to acquire test funds for ${token}`,
    body: null,
    errorCode: "UNREACHABLE",
  }
}
