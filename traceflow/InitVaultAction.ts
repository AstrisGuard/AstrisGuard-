import { z } from "zod"
import { Wallet } from "@solscan/solscan-sdk"
import { AstrisGuardActionCore, ActionResponse } from "astrisguard-base-action"
import { AstrisGuardVaultEngine } from "./astrisGuardVaultEngine"

export const InitVaultSchema = z.object({
  vaultId: z.string().uuid(),
  ownerAddress: z.string().min(32),
  initialCollateral: z.number().nonnegative(),
})

export type InitVaultInput = z.infer<typeof InitVaultSchema>
export type InitVaultResult = {
  success: boolean
  vaultId: string
  message: string
}

export class AstrisGuardInitVaultAction implements AstrisGuardActionCore<typeof InitVaultSchema, InitVaultResult, Wallet> {
  schema = InitVaultSchema
  description = "AstrisGuard"

  async execute(wallet: Wallet, input: InitVaultInput): Promise<ActionResponse<InitVaultResult>> {
    const parsed = this.schema.parse(input)
    const engine = new AstrisGuardVaultEngine({ networkId: "mainnet", clientSource: "astrisguard-app" })
    engine.setWallet(wallet)

    try {
      await engine.initializeVault(parsed.vaultId, parsed.initialCollateral)
      return {
        data: {
          success: true,
          vaultId: parsed.vaultId,
          message: "Well done",
        },
      }
    } catch (error: any) {
      return {
        data: {
          success: false,
          vaultId: parsed.vaultId,
          message: error.message || "Error",
        },
      }
    }
  }
}
