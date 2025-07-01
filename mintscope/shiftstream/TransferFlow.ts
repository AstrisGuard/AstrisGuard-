
import { DefineAssetTransferSchema, AssetTransferArgs } from "./defineAssetTransferSchema"
import { getTransferHandler, supportedTransferTypes } from "./assetTransferTypeMap"
import type { VaultResult } from "./vaultResult"

export async function startAssetTransferFlow(
  raw: unknown
): Promise<VaultResult<{ transactionHash: string; symbol: string }>> {
  const parsed = DefineAssetTransferSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, message: parsed.error.message, data: null }
  }
  const args: AssetTransferArgs = parsed.data
  if (!supportedTransferTypes.includes(args.flow)) {
    return { success: false, message: `Unsupported flow ${args.flow}`, data: null }
  }
  const handler = getTransferHandler(args.flow)
  const result = await handler(args)
  return result
}
