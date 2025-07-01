export interface PatternMatch {
  index: number
  pattern: string
  score: number
}

export type Sequence = string[]

export function findSubsequence(
  sequence: Sequence,
  subseq: Sequence
): number[] {
  const matches: number[] = []
  const len = subseq.length
  for (let i = 0; i <= sequence.length - len; i++) {
    let match = true
    for (let j = 0; j < len; j++) {
      if (sequence[i + j] !== subseq[j]) {
        match = false
        break
      }
    }
    if (match) matches.push(i)
  }
  return matches
}

export function scorePattern(
  sequence: Sequence,
  pattern: Sequence
): number {
  const matches = findSubsequence(sequence, pattern)
  return Math.round((matches.length / Math.max(sequence.length, 1)) * 10000) / 10000
}

export function detectPatterns(
  sequence: Sequence,
  patterns: Sequence[]
): PatternMatch[] {
  const results: PatternMatch[] = []
  for (const p of patterns) {
    const positions = findSubsequence(sequence, p)
    for (const idx of positions) {
      results.push({
        index: idx,
        pattern: p.join("-"),
        score: scorePattern(sequence.slice(idx), p)
      })
    }
  }
  return results
}

export function rankPatternMatches(
  matches: PatternMatch[],
  topN: number
): PatternMatch[] {
  return matches
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

export function normalizeMatchScores(
  matches: PatternMatch[]
): PatternMatch[] {
  const maxScore = Math.max(...matches.map(m => m.score), 1)
  return matches.map(m => ({
    index: m.index,
    pattern: m.pattern,
    score: Math.round((m.score / maxScore) * 10000) / 10000
  }))
}
