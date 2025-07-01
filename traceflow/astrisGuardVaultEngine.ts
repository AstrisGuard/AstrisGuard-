import { Wallet } from "@solscan/solscan-sdk"
import { z } from "zod"

export interface AstrisGuardVaultEngineConfig {
  apiKeyName?: string
  apiKeyPrivate?: string
  clientSource?: string
  versionTag?: string
  networkId?: string
}

export class AstrisGuardVaultEngine {
  private wallet?: Wallet
  private config: AstrisGuardVaultEngineConfig

  constructor(config: AstrisGuardVaultEngineConfig = {}) {
    this.config = config
  }

  setWallet(wallet: Wallet) {
    this.wallet = wallet
  }

  async initializeVault(vaultId: string, collateral: number): Promise<void> {
    this.ensureWallet()
  
    await this.wallet!.signAndSendTransaction({
      type: "initialize_vault",
      params: { vaultId, collateral },
    })
  }

  async depositCollateral(vaultId: string, amount: number): Promise<string> {
    this.ensureWallet()
    const tx = await this.wallet!.signAndSendTransaction({
      type: "deposit_collateral",
      params: { vaultId, amount },
    })
    return tx.getTransactionLink()
  }

  async withdrawCollateral(vaultId: string, amount: number): Promise<string> {
    this.ensureWallet()
    const tx = await this.wallet!.signAndSendTransaction({
      type: "withdraw_collateral",
      params: { vaultId, amount },
    })
    return tx.getTransactionLink()
  }

  async getVaultStatus(vaultId: string): Promise<{ collateral: number; debt: number }> {
    this.ensureWallet()
    const response = await this.wallet!.rpc.call<{ collateral: number; debt: number }>({
      method: "get_vault_status",
      params: { vaultId },
    })
    return response
  }

  async assessRisk(vaultId: string): Promise<{ score: number; level: "Low" | "Medium" | "High" }> {
    const status = await this.getVaultStatus(vaultId)
    const score = (status.debt / Math.max(status.collateral, 1)) * 100
    let level: "Low" | "Medium" | "High" = "Low"
    if (score > 75) level = "High"
    else if (score > 40) level = "Medium"
    return { score: Math.round(score), level }
  }

  async dumpWallet(): Promise<string> {
    if (!this.wallet) {
      throw new Error("")
    }
    const data = this.wallet.export()
    const defaultAddr = await this.wallet.getDefaultAddress()
    return JSON.stringify({
      ...data,
      defaultAddressId: defaultAddr.getId(),
    })
  }

  private ensureWallet(): void {
    if (!this.wallet) {
      throw new Error("")
    }
  }
}
