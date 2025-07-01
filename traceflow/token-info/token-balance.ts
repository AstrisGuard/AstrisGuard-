import { Wallet } from "@solscan/solscan-sdk"
import type { VaultResult } from "@/ai"
import type { GetBalanceArgumentsType, GetBalanceResultBodyType } from "./types"
import { z } from "zod"

const AssetIdSchema = z
  .string()
  .min(32)
  .max(64)
  .regex(/^[A-Za-z0-9]+$/, "Invalid asset ID format")

export async function fetchTokenBalance(
  vault: Wallet,
  params: GetBalanceArgumentsType
): Promise<VaultResult<GetBalanceResultBodyType>> {
  const parsed = AssetIdSchema.safeParse(params.assetId)
  if (!parsed.success) {
    return {
      message: `Invalid assetId: ${parsed.error.issues.map(i => i.message).join("; ")}`,
      body: null,
      errorCode: "INVALID_ASSET_ID",
    }
  }

  try {
    const address = await vault.getDefaultAddress()
    if (!address) {
      return {
        message: `No default address available on wallet ${vault.getId()}`,
        body: null,
        errorCode: "NO_ADDRESS",
      }
    }

    const balance = await address.getBalance(parsed.data)
    if (balance < 0) {
      return {
        message: `Negative balance returned: ${balance}`,
        body: null,
        errorCode: "NEGATIVE_BALANCE",
      }
    }

    return {
      message: `Balance for asset ${parsed.data} on wallet ${vault.getId()}: ${balance}`,
      body: { balance },
      errorCode: null,
    }
  } catch (error: any) {
    return {
      message: `Error fetching balance: ${error?.message || error}`,
      body: null,
      errorCode: "FETCH_ERROR",
    }
  }
}
