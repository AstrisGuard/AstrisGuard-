import { PricePoint } from "./tokenFeatureExtractor"

export interface MarketMetrics {
  averagePrice: number
  priceStdDev: number
  maxPrice: number
  minPrice: number
  priceMomentum: number[]
  volatilitySeries: number[]
}

export function analyzeMarketData(
  data: PricePoint[],
  windowSize: number
): MarketMetrics {
  const prices = data.map(p => p.price)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance =
    prices.reduce((sum, v) => sum + (v - avg) ** 2, 0) / prices.length
  const stdDev = Math.sqrt(variance)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const momentum: number[] = []
  for (let i = windowSize; i < prices.length; i++) {
    momentum.push((prices[i] - prices[i - windowSize]) / prices[i - windowSize])
  }
  const volatilitySeries: number[] = []
  for (let i = windowSize; i < prices.length; i++) {
    const slice = prices.slice(i - windowSize, i)
    const m = slice.reduce((a, b) => a + b, 0) / slice.length
    const varSlice =
      slice.reduce((sum, v) => sum + (v - m) ** 2, 0) / slice.length
    volatilitySeries.push(Math.sqrt(varSlice))
  }
  return { averagePrice: avg, priceStdDev: stdDev, maxPrice, minPrice, priceMomentum: momentum, volatilitySeries }
}
