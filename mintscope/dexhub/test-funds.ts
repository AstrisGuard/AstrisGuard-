import { Wallet } from "@solana/solana-sdk"
import { z } from "zod"
import type {
  RequestFaucetFundsArgumentsType,
  RequestFaucetFundsActionResultType,
} from "./types"

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
    const message = parsed.error.issues.map(i => i.message).join("; ")
    return {
      message: `Invalid parameters: ${message}`,
      body: null,
      errorCode: "INVALID_PARAMS",
    }
  }

  const { assetId, retryCount, timeoutMs } = parsed.data
  const token = assetId || "SOL"

  const tryRequest = async (): Promise<RequestFaucetFundsActionResultType> => {
    const tx = await wallet.faucet(assetId || undefined)

    const confirmation = await Promise.race([
      tx.wait(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeoutMs)
      ),
    ])

    const link =
      typeof confirmation.getTransactionLink === "function"
        ? confirmation.getTransactionLink()
        : "No link available"

    return {
      message: `✅ Test tokens for ${token} received`,
      body: { transactionLink: link },
      errorCode: null,
    }
  }

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await tryRequest()
    } catch (error: any) {
      const isLastAttempt = attempt === retryCount
      const errMsg = typeof error === "string" ? error : error?.message || "Unknown error"

      if (isLastAttempt) {
        return {
          message: `❌ Faucet request failed for ${token}: ${errMsg}`,
          body: null,
          errorCode: "FAUCET_ERROR",
        }
      }
    }
  }

}
