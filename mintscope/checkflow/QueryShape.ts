
import { z } from "zod"

export const DefineBalanceQueryShape = z
  .object({
    walletAddress: z
      .string()
      .min(32)
      .max(64)
      .regex(/^[A-Za-z0-9]+$/, "Invalid wallet address")
      .describe("address of the wallet to query"),
    assetId: z
      .string()
      .min(3)
      .max(64)
      .regex(/^[A-Za-z0-9]+$/, "Invalid asset identifier")
      .optional()
      .describe("identifier of the asset (omit for native)"),
    chain: z
      .enum(["solana", "ethereum", "polygon"])
      .default("solana")
      .describe("blockchain network"),
    includeHistory: z
      .boolean()
      .default(false)
      .describe("whether to include balance history"),
  })
  .strict()

export type BalanceQueryArgs = z.infer<typeof DefineBalanceQueryShape>
