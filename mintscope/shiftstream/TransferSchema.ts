
import { z } from "zod"

export const DefineAssetTransferSchema = z
  .object({
    assetId: z.string().min(1).max(64).regex(/^[A-Za-z0-9]+$/),
    amount: z.number().positive(),
    destination: z.string().min(32).max(64).regex(/^[A-Za-z0-9]+$/),
    gasless: z.boolean().default(false),
    flow: z.enum(["transfer", "deposit", "withdraw", "emergency"]).default("transfer"),
  })
  .strict()

export type AssetTransferArgs = z.infer<typeof DefineAssetTransferSchema>
