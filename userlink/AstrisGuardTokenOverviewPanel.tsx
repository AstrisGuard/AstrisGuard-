import React from "react"

interface AstrisGuardTokenOverviewPanelProps {
  name: string
  symbol: string
  price: number
  change24h: number
  liquidity: number
  holders: number
  confidenceScore?: number
}

export const AstrisGuardTokenOverviewPanel: React.FC<AstrisGuardTokenOverviewPanelProps> = ({
  name,
  symbol,
  price,
  change24h,
  liquidity,
  holders,
  confidenceScore = 50
}) => {
  const changeClass = change24h >= 0 ? "positive" : "negative"
  const arrow = change24h >= 0 ? "▲" : "▼"

  return (
    <div className="astrisguard-token-overview" style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", maxWidth: "400px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{name} <span style={{ fontWeight: "normal", color: "#555" }}>({symbol})</span></h2>
        <span style={{ fontSize: "1.1rem", color: "#333" }}>${price.toFixed(2)}</span>
      </header>

      <ul style={{ padding: "0", margin: "16px 0", listStyle: "none", color: "#444" }}>
        <li className={changeClass}>
          24h Change: {arrow} {Math.abs(change24h).toFixed(2)}%
        </li>
        <li>Liquidity: ${liquidity.toLocaleString()}</li>
        <li>Holders: {holders.toLocaleString()}</li>
        <li>Confidence Score: {confidenceScore}/100</li>
      </ul>

      <div className="confidence-bar" style={{ backgroundColor: "#eee", borderRadius: "4px", overflow: "hidden" }}>
        <div 
          className="bar-fill" 
          style={{
            width: `${confidenceScore}%`,
            backgroundColor: confidenceScore > 70 ? "#6C63FF" : "#F44336",
            height: "8px"
          }}
        />
      </div>
    </div>
)

export default AstrisGuardTokenOverviewPanel
