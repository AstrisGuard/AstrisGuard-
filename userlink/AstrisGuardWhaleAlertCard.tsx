import React from "react"

interface AstrisGuardWhaleAlertCardProps {
  walletAddress: string
  amountMoved: number
  token: string
  timestamp: number
  network?: string
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hrs ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function truncateAddress(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

export const AstrisGuardWhaleAlertCard: React.FC<AstrisGuardWhaleAlertCardProps> = ({
  walletAddress,
  amountMoved,
  token,
  timestamp,
  network = "Solana"
}) => {
  return (
    <div style={{ border: "2px solid #6C63FF", borderRadius: "10px", padding: "20px", maxWidth: "360px", backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h4 style={{ margin: "0 0 12px 0", color: "#6C63FF" }}>🚨 AstrisGuard Whale Alert</h4>
      <p><strong>Wallet:</strong> {truncateAddress(walletAddress)}</p>
      <p><strong>Amount:</strong> {amountMoved.toLocaleString()} {token}</p>
      <p><strong>Network:</strong> {network}</p>
      <p><strong>Time:</strong> {formatTimeAgo(timestamp)}</p>
    </div>
)

export default AstrisGuardWhaleAlertCard
