

export interface PricePoint {
  timestamp: number
  price: number
}

export interface VolumePoint {
  timestamp: number
  volume: number
}

export interface FeatureVector {
  timestamp: number
  priceMomentum: number
  volatility: number
  volumeSpike: boolean
  relativeVolume: number
}

export class TokenFeatureExtractor {
  constructor(private priceData: PricePoint[], private volumeData: VolumePoint[]) {}

  extract(): FeatureVector[] {
    const features: FeatureVector[] = []
    const maxVolume = Math.max(...this.volumeData.map(v => v.volume), 1)

    for (let i = 1; i < this.priceData.length; i++) {
      const prev = this.priceData[i - 1]
      const curr = this.priceData[i]
      const momentum = (curr.price - prev.price) / prev.price
      const sliceVol = this.volumeData
        .filter(v => v.timestamp <= curr.timestamp && v.timestamp > curr.timestamp - 60000)
        .map(v => v.volume)
      const recentVol = sliceVol.reduce((a, b) => a + b, 0)
      const relVol = recentVol / maxVolume
      const spike = relVol > 0.8

      features.push({
        timestamp: curr.timestamp,
        priceMomentum: Math.round(momentum * 1e6) / 1e6,
        volatility: this.computeVolatility(i),
        volumeSpike: spike,
        relativeVolume: Math.round(relVol * 1e3) / 1e3,
      })
    }

    return features
  }

  private computeVolatility(index: number, window = 10): number {
    const start = Math.max(0, index - window)
    const slice = this.priceData.slice(start, index + 1).map(p => p.price)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const variance =
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length
    return Math.round(Math.sqrt(variance) * 1e6) / 1e6
  }
}
