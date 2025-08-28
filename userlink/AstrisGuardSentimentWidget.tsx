import React, { useMemo } from "react"

interface AstrisGuardSentimentWidgetProps {
  sentimentScore: number // 0..100
  trend: "Bullish" | "Bearish" | "Neutral"
  dominantToken: string
  totalVolume24h: number
  className?: string
}

/** clamp to [0,100] and round to integer for display */
const normalizeScore = (score: number): number => {
  if (!Number.isFinite(score)) return 0
  if (score < 0) return 0
  if (score > 100) return 100
  return Math.round(score)
}

const trendStyles: Record<AstrisGuardSentimentWidgetProps["trend"], string> = {
  Bullish:
    "bg-green-100 text-green-800 ring-1 ring-green-200",
  Bearish:
    "bg-red-100 text-red-800 ring-1 ring-red-200",
  Neutral:
    "bg-gray-100 text-gray-800 ring-1 ring-gray-200",
}

const scoreColor = (score: number): string => {
  if (score >= 80) return "bg-indigo-600"
  if (score >= 50) return "bg-amber-500"
  return "bg-rose-500"
}

const ringColor = (score: number): string => {
  if (score >= 80) return "ring-indigo-300"
  if (score >= 50) return "ring-amber-300"
  return "ring-rose-300"
}

const formatUSD = (n: number): string =>
  Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"

/**
 * AstrisGuard Market Sentiment widget
 * - Tailwind-only styling
 * - Accessible labels
 * - Deterministic visuals (no randomness)
 */
export const AstrisGuardSentimentWidget: React.FC<AstrisGuardSentimentWidgetProps> = ({
  sentimentScore,
  trend,
  dominantToken,
  totalVolume24h,
  className = "",
}) => {
  const score = useMemo(() => normalizeScore(sentimentScore), [sentimentScore])

  const circleClasses = useMemo(
    () =>
      `flex items-center justify-center rounded-full h-20 w-20 text-white text-lg font-semibold ${scoreColor(
        score
      )} ring ${ringColor(score)} shadow-sm`,
    [score]
  )

  const barTrack =
    "h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
  const barFill = `h-2 ${scoreColor(score)}`

  return (
    <section
      className={`astrisguard-sentiment-widget rounded-xl border-2 border-indigo-500/70 p-4 md:p-5 bg-white dark:bg-neutral-900 shadow-sm ${className}`}
      aria-label="AstrisGuard Market Sentiment"
    >
      <header className="mb-4">
        <h3 className="text-base md:text-lg font-semibold text-indigo-700 dark:text-indigo-300">
          AstrisGuard Market Sentiment
        </h3>
      </header>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Score circle */}
        <div className={circleClasses} aria-label="Sentiment score" role="img">
          <span>{score}%</span>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Trend</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${trendStyles[trend]}`}>
              {trend}
            </span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-300">Dominant Token: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{dominantToken}</span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-300">24h Volume: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              ${formatUSD(totalVolume24h)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="pt-1" aria-label="Sentiment gauge">
            <div className={barTrack}>
              <div
                className={barFill}
                style={{ width: `${score}%` }}
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AstrisGuardSentimentWidget
