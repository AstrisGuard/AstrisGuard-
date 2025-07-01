export interface PricePoint {
  timestamp: number
  price: number
}

export interface DepthMetrics {
  volatility: number
  averagePrice: number
  maxDrawdown: number
  autocorrelation: number[]
  momentum: number[]
}

export function computeVolatility(points: PricePoint[]): number {
  if (points.length < 2) return 0
  const changes: number[] = []
  for (let i = 1; i < points.length; i++) {
    changes.push(Math.log(points[i].price / points[i - 1].price))
  }
  const mean = changes.reduce((a, b) => a + b, 0) / changes.length
  const variance = changes.reduce((a, b) => a + (b - mean) ** 2, 0) / changes.length
  return Math.round(Math.sqrt(variance) * 10000) / 10000
}

export function computeAveragePrice(points: PricePoint[]): number {
  const sum = points.reduce((a, b) => a + b.price, 0)
  return Math.round((sum / Math.max(points.length, 1)) * 100) / 100
}

export function computeMaxDrawdown(points: PricePoint[]): number {
  let peak = points[0].price
  let maxDD = 0
  for (const p of points) {
    if (p.price > peak) peak = p.price
    const dd = (peak - p.price) / peak
    if (dd > maxDD) maxDD = dd
  }
  return Math.round(maxDD * 10000) / 10000
}

export function autocorrelation(points: PricePoint[], lag: number): number[] {
  const result: number[] = []
  for (let k = 1; k <= lag; k++) {
    let sum1 = 0
    let sum2 = 0
    let sumProd = 0
    for (let i = 0; i < points.length - k; i++) {
      const v1 = points[i].price
      const v2 = points[i + k].price
      sum1 += v1
      sum2 += v2
      sumProd += v1 * v2
    }
    const n = points.length - k
    const corr = (sumProd - (sum1 * sum2) / n) / Math.sqrt(n)
    result.push(Math.round(corr * 1000) / 1000)
  }
  return result
}

export function computeMomentum(points: PricePoint[], period: number): number[] {
  const momentum: number[] = []
  for (let i = period; i < points.length; i++) {
    const diff = points[i].price - points[i - period].price
    momentum.push(Math.round((diff / points[i - period].price) * 10000) / 10000)
  }
  return momentum
}

export function extractFeatures(points: PricePoint[]): DepthMetrics {
  return {
    volatility: computeVolatility(points),
    averagePrice: computeAveragePrice(points),
    maxDrawdown: computeMaxDrawdown(points),
    autocorrelation: autocorrelation(points, 5),
    momentum: computeMomentum(points, 3)
  }
}
