export interface Order {
  price: number
  size: number
}

export interface OrderBook {
  bids: Order[]
  asks: Order[]
}

export interface DepthMetrics {
  bidDepth: number
  askDepth: number
  spread: number
  topBid: number
  topAsk: number
  imbalance: number
}

export function analyzeOrderBook(
  book: OrderBook,
  depthLevels: number
): DepthMetrics {
  const bids = book.bids.slice(0, depthLevels)
  const asks = book.asks.slice(0, depthLevels)
  const bidDepth = bids.reduce((sum, o) => sum + o.size, 0)
  const askDepth = asks.reduce((sum, o) => sum + o.size, 0)
  const topBid = bids[0]?.price || 0
  const topAsk = asks[0]?.price || 0
  const spread = topAsk - topBid
  const imbalance =
    bidDepth + askDepth > 0 ? (bidDepth - askDepth) / (bidDepth + askDepth) : 0
  return { bidDepth, askDepth, spread, topBid, topAsk, imbalance }
}

export function flattenDepth(
  book: OrderBook
): { price: number; netSize: number }[] {
  const map: Record<number, number> = {}
  book.bids.forEach(o => (map[o.price] = (map[o.price] || 0) + o.size))
  book.asks.forEach(o => (map[o.price] = (map[o.price] || 0) - o.size))
  return Object.entries(map).map(([p, s]) => ({ price: Number(p), netSize: s }))
}
