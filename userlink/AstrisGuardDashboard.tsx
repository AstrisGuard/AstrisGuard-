import React from "react"
import { AstrisGuardTokenOverviewPanel } from "./AstrisGuardTokenOverviewPanel"
import { RiskSignalBadge } from "./RiskSignalBadge"
import { WalletActivityGraph } from "./WalletActivityGraph"
import { AstrisGuardWhaleAlertCard } from "./AstrisGuardWhaleAlertCard"
import { AlertBanner } from "./AlertBanner"

const themeColor = "#6C63FF"

interface TokenData {
  name: string
  symbol: string
  riskLevel: "Low" | "Moderate" | "High"
  volume: number
}

interface TransferData {
  amount: number
  token: string
  address: string
}

interface ActivityPoint {
  time: string
  value: number
}

export const AstrisGuardDashboard: React.FC = () => {
  const tokenData: TokenData = {
    name: "AstrisGuard Token",
    symbol: "AGU",
    riskLevel: "High",
    volume: 2450000,
  }

  const whaleTransfers: TransferData[] = [
    { amount: 200000, token: "AGU", address: "AG1x2y3z...9AbC" },
    { amount: 150000, token: "AGU", address: "AG9w8x7y...4DeF" },
  ]

  const walletActivity: ActivityPoint[] = [
    { time: "08:00", value: 500 },
    { time: "12:00", value: 1200 },
    { time: "16:00", value: 800 },
    { time: "20:00", value: 1600 },
  ]

  return (
    <div className="astrisguard-dashboard" style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <AlertBanner message="Critical alert: Suspicious AGU movement detected" color={themeColor} />

      <section className="dashboard-section" style={{ display: "flex", gap: "24px", marginTop: "16px" }}>
        <AstrisGuardTokenOverviewPanel
          name={tokenData.name}
          symbol={tokenData.symbol}
          price={3.75}
          change24h={-12.5}
          liquidity={1200000}
          holders={32000}
          confidenceScore={tokenData.riskLevel === "High" ? 45 : 85}
        />
        <RiskSignalBadge level={tokenData.riskLevel} color={themeColor} />
      </section>

      <section className="dashboard-section" style={{ display: "flex", gap: "24px", marginTop: "32px" }}>
        <WalletActivityGraph data={walletActivity} lineColor={themeColor} />
        <AstrisGuardWhaleAlertCard 
          walletAddress={whaleTransfers[0].address} 
          amountMoved={whaleTransfers[0].amount} 
          token={whaleTransfers[0].token} 
          timestamp={Date.now() - 900000} 
          network="Solana"
        />
      </section>
    </div>
)

export default AstrisGuardDashboard
