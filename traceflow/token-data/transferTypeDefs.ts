import { z } from "zod"
import type { VaultResult } from "../transfer"
import { AssetTransferSchema } from "./schemamap"

export type AssetTransferArgs = z.infer<typeof AssetTransferSchema>

export interface TransferPayload {
  transactionHash: string
  symbol: AssetTransferArgs["assetId"]
}

export interface AssetTransferOutcome extends VaultResult<TransferPayload> {
  errorCode?: string
}
