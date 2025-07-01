import { z } from "zod"

export const AssetTransferSchema = z
  .object({
    amount: z
      .number()
      .positive()
      .refine(v => Number.isFinite(v), "Amount must be a finite number")
      .describe("количество токенов для перевода"),
    assetId: z
      .string()
      .min(32)
      .max(64)
      .regex(/^[A-Za-z0-9]+$/, "Invalid asset ID format")
      .describe("ID токена для перевода"),
    destination: z
      .string()
      .min(32)
      .max(64)
      .regex(/^[A-Za-z0-9]+$/, "Invalid wallet address format")
      .describe("адрес получателя"),
    gasless: z
      .boolean()
      .default(false)
      .describe("использовать gasless-транзакцию, если поддерживается"),
  })
  .strict()
