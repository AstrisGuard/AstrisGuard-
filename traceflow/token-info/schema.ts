import { z } from "zod"

export const BalanceQuerySchema = z
  .object({
    assetId: z
      .string()
      .min(32)
      .max(64)
      .regex(/^([A-Za-z0-9]{32,64})$/, "Invalid asset ID format"),

    queryType: z
      .enum(["wallet", "vault", "portfolio"])
      .default("wallet"),
  })
  .strip()
