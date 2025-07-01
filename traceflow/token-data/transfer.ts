import { z } from "zod"
import type { TransferArgumentsType, TransferActionResultType } from "./types"

const TransferParamsSchema = z.object({
  amount: z.number().positive(),
  assetId: z.string().min(1),
  destination: z.string().min(32).max(64),
  gasless: z.boolean(),
})

export async function initiateTransfer(
  sender: Wallet,
  params: TransferArgumentsType
): Promise<TransferActionResultType> {
  const parsed = TransferParamsSchema.safeParse(params)
  if (!parsed.success) {
    return {
      message: `Invalid parameters: ${parsed.error.issues
        .map(i => i.message)
        .join("; ")}`,
      errorCode: "INVALID_PARAMS",
    }
  }
  const { amount, assetId, destination, gasless } = parsed.data

  try {
    const response = await sender.createTransfer({
      amount,
      assetId,
      destination,
      gasless,
    })
    const confirmation = await response.wait()
    const tx = confirmation.getTransaction()
    if (!tx) {
      return { message: "No transaction returned", errorCode: "NO_TX" }
    }
    const hash = tx.getTransactionHash()
    if (!hash) {
      return { message: "Missing transaction hash", errorCode: "NO_HASH" }
    }
    const link = tx.getTransactionLink()
    return {
      message: `Sent ${amount} ${assetId} to ${destination}\nHash: ${hash}\nLink: ${link}`,
      body: { transactionHash: hash, symbol: assetId },
      errorCode: null,
    }
  } catch (error: any) {
    return {
      message: `Transfer failed: ${error.message || error}`,
      errorCode: "TRANSFER_ERROR",
    }
  }
}