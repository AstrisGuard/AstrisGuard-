import React from "react"

interface AstrisGuardSentimentWidgetProps {
  sentimentScore: number
  trend: "Bullish" | "Bearish" | "Neutral"
  dominantToken: string
  totalVolume24h: number
}

const getSentimentColor = (score: number): string => {
  if (score >= 80) return "#6C63FF"
  if (score >= 50) return "#FFC107"
  return "#F44336"
}

export const AstrisGuardSentimentWidget: React.FC<AstrisGuardSentimentWidgetProps> = ({
  sentimentScore,
  trend,
  dominantToken,
  totalVolume24h
}) => {
  return (
    <div className="astrisguard-sentiment-widget" style={{ border: "2px solid #6C63FF", borderRadius: "8px", padding: "16px" }}>
      <h3 style={{ marginBottom: "12px", color: "#6C63FF" }}>AstrisGuard Market Sentiment</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div 
          className="score-circle" 
          style={{
            backgroundColor: getSentimentColor(sentimentScore),
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            color: "#FFFFFF"
          }}
        >
          {sentimentScore}%
        </div>
        <div className="details" style={{ listStyle: "none" }}>
          <div><strong>Trend:</strong> {trend}</div>
          <div><strong>Dominant Token:</strong> {dominantToken}</div>
          <div><strong>24h Volume:</strong> ${totalVolume24h.toLocaleString()}</div>
        </div>
      </div>
    </div>
)

export default AstrisGuardSentimentWidget
