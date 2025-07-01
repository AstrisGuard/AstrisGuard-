
import type { AssetTransferArgs } from "./defineAssetTransferSchema"
import { initiateTransfer } from "./startAssetTransferFlow"
import { VaultResult } from "./vaultResult"

type Handler = (args: AssetTransferArgs) => Promise<VaultResult<{ transactionHash: string; symbol: string }>>

const handlers: Record<string, Handler> = {
  transfer: async args => initiateTransfer(args),
  deposit: async args => initiateTransfer({ ...args, flow: "deposit" }),
  withdraw: async args => initiateTransfer({ ...args, flow: "withdraw" }),
  emergency: async args => initiateTransfer({ ...args, flow: "emergency" }),
}

export function getTransferHandler(type: keyof typeof handlers): Handler {
  const handler = handlers[type]
  if (!handler) {
    throw new Error(`Unknown transfer type ${type}`)
  }
  return handler
}

export const supportedTransferTypes = Object.keys(handlers) as (keyof typeof handlers)[]
