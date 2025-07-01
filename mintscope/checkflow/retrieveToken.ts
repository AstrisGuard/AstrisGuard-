
import type { Wallet } from "@solana/solana-sdk"

export interface BalanceItem {
  assetId: string
  balance: number
  timestamp: number
}

export interface BalanceResponse {
  current: BalanceItem[]
  history?: BalanceItem[] 
}

export async function retrieveTokenBalances(
  wallet: Wallet,
  args: BalanceQueryArgs
): Promise<VaultResult<BalanceResponse>> {
  const { walletAddress, assetId, includeHistory } = args
  try {
    await wallet.connect(walletAddress)
    const balances: BalanceItem[] = []
    if (assetId) {
      const bal = await wallet.getBalance(assetId)
      balances.push({ assetId, balance: bal, timestamp: Date.now() })
    } else {
      const assets = await wallet.listAssets()
      for (const id of assets) {
        const bal = await wallet.getBalance(id)
        balances.push({ assetId: id, balance: bal, timestamp: Date.now() })
      }
    }
    let history: BalanceItem[] | undefined = undefined
    if (includeHistory) {
      history = []
      for (const item of balances) {
        const records = await wallet.getBalanceHistory(item.assetId, 10)
        for (const rec of records) {
          history.push({ assetId: item.assetId, balance: rec.balance, timestamp: rec.timestamp })
        }
      }
    }
    return { success: true, data: { current: balances, history }, message: "" }
  } catch (err: any) {
    return { success: false, data: null, message: String(err) }
  }
}
