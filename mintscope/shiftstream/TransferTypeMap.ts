import type { AssetTransferArgs } from "./defineAssetTransferSchema"
import { initiateTransfer } from "./startAssetTransferFlow"
import type { VaultResult } from "./vaultResult"

export type TransferType = "transfer" | "deposit" | "withdraw" | "emergency"
export type TransferHandler = (
  args: AssetTransferArgs
) => Promise<VaultResult<{ transactionHash: string; symbol: string }>>

// Built‐in handlers
const builtInHandlers: Record<TransferType, TransferHandler> = {
  transfer: args => initiateTransfer(args),
  deposit: args => initiateTransfer({ ...args, flow: "deposit" }),
  withdraw: args => initiateTransfer({ ...args, flow: "withdraw" }),
  emergency: args => initiateTransfer({ ...args, flow: "emergency" }),
}

// Registry allows adding or overriding handlers
const handlerRegistry = new Map<TransferType, TransferHandler>(
  Object.entries(builtInHandlers) as [TransferType, TransferHandler][]
)

/**
 * Register or override a handler for a given transfer type.
 */
export function registerTransferHandler(
  type: TransferType,
  handler: TransferHandler
): void {
  handlerRegistry.set(type, handler)
}

/**
 * Retrieve the handler for a given transfer type.
 * Throws if no handler is registered.
 */
export function getTransferHandler(type: TransferType): TransferHandler {
  const handler = handlerRegistry.get(type)
  if (!handler) {
    throw new Error(`No handler registered for transfer type "${type}"`)
  }
  return handler
}

/**
 * Execute a transfer of the specified type with built-in error logging.
 */
export async function executeTransfer(
  type: TransferType,
  args: AssetTransferArgs
): Promise<VaultResult<{ transactionHash: string; symbol: string }>> {
  const handler = getTransferHandler(type)
  try {
    return await handler(args)
  } catch (err: any) {
    console.error(`[Transfer:${type}] Error executing transfer`, err)
    throw err
  }
}

/**
 * List all currently supported transfer types.
 */
export function listSupportedTransferTypes(): TransferType[] {
  return Array.from(handlerRegistry.keys())
}
