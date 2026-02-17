import { describe, it, expect } from 'vitest'
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculateClosenessCentrality,
  calculateEigenvectorCentrality,
  calculatePageRank,
} from '../src/managers/metrics.js'

// ==========================================================================
// Network metrics — unit tests with known graph topologies
// ==========================================================================

const PRECISION = 5

// Helper: build a minimal cache-like object for the metric functions
function makeCache(nodeIds, edges) {
  const nodeIDsToBeShown = new Set(nodeIds)
  const edgeRef = new Map()
  const edgeIDsToBeShown = new Set()

  for (const [source, target] of edges) {
    const id = `${source}::${target}`
    edgeIDsToBeShown.add(id)
    edgeRef.set(id, { source, target })
  }

  return { nodeIDsToBeShown, edgeIDsToBeShown, edgeRef }
}

// --------------------------------------------------------------------------
// Degree Centrality
// --------------------------------------------------------------------------

describe('Degree Centrality', () => {
  it('returns empty results for empty graph', async () => {
    const cache = makeCache([], [])
    const result = await calculateDegreeCentrality(cache)
    expect(result.scores).toEqual([])
  })

  it('calculates star graph correctly', async () => {
    // Star: center connected to A, B, C, D
    const cache = makeCache(
      ['center', 'A', 'B', 'C', 'D'],
      [['center', 'A'], ['center', 'B'], ['center', 'C'], ['center', 'D']]
    )
    const result = await calculateDegreeCentrality(cache)

    // Center has degree 4 out of 4 possible → centrality = 4/4 = 1.0
    const centerScore = result.nodeValues.get('center')
    expect(centerScore).toBe(1.0)

    // Leaf nodes have degree 1 out of 4 possible → centrality = 1/4 = 0.25
    expect(result.nodeValues.get('A')).toBe(0.25)
    expect(result.nodeValues.get('B')).toBe(0.25)

    // Center should be first (highest)
    expect(result.scores[0].id).toBe('center')
  })

  it('calculates complete graph (K4) correctly', async () => {
    // K4: every node connected to every other
    const cache = makeCache(
      ['A', 'B', 'C', 'D'],
      [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D']]
    )
    const result = await calculateDegreeCentrality(cache)

    // Every node has degree 3 out of 3 possible → centrality = 1.0
    for (const id of ['A', 'B', 'C', 'D']) {
      expect(result.nodeValues.get(id)).toBe(1.0)
    }

    // Graph density should be 1.0 for a complete graph
    expect(result.graphLevelMetrics["Graph Density"]).toBe(1)
  })

  it('handles isolated node correctly', async () => {
    // A--B  C (isolated)
    const cache = makeCache(['A', 'B', 'C'], [['A', 'B']])
    const result = await calculateDegreeCentrality(cache)

    expect(result.nodeValues.get('A')).toBe(0.5)
    expect(result.nodeValues.get('B')).toBe(0.5)
    expect(result.nodeValues.get('C')).toBe(0)
  })

  it('calculates path graph correctly', async () => {
    // A -- B -- C
    const cache = makeCache(['A', 'B', 'C'], [['A', 'B'], ['B', 'C']])
    const result = await calculateDegreeCentrality(cache)

    // B has degree 2 out of 2 possible → 1.0
    expect(result.nodeValues.get('B')).toBe(1.0)
    // A and C have degree 1 out of 2 possible → 0.5
    expect(result.nodeValues.get('A')).toBe(0.5)
    expect(result.nodeValues.get('C')).toBe(0.5)
  })

  it('returns correct graph-level metrics', async () => {
    const cache = makeCache(
      ['A', 'B', 'C', 'D'],
      [['A', 'B'], ['B', 'C'], ['B', 'D']]
    )
    const result = await calculateDegreeCentrality(cache)
    const glm = result.graphLevelMetrics

    expect(glm).toHaveProperty('Maximum Degree Centrality')
    expect(glm).toHaveProperty('Minimum Degree Centrality')
    expect(glm).toHaveProperty('Average Degree Centrality')
    expect(glm).toHaveProperty('Median Degree')
    expect(glm).toHaveProperty('Graph Density')
    expect(glm).toHaveProperty('Centralization')

    // B has degree 3 (highest)
    expect(glm['Maximum Degree Centrality']).toBe(3)
  })
})

// --------------------------------------------------------------------------
// Betweenness Centrality
// --------------------------------------------------------------------------

describe('Betweenness Centrality', () => {
  it('returns empty results for empty graph', async () => {
    const cache = makeCache([], [])
    const result = await calculateBetweennessCentrality(cache)
    expect(result.scores).toEqual([])
  })

  it('identifies the bridge node in a path graph', async () => {
    // A -- B -- C
    // B is on all shortest paths between A↔C
    const cache = makeCache(['A', 'B', 'C'], [['A', 'B'], ['B', 'C']])
    const result = await calculateBetweennessCentrality(cache)

    expect(result.nodeValues.get('B')).toBeGreaterThan(0)
    expect(result.nodeValues.get('A')).toBe(0)
    expect(result.nodeValues.get('C')).toBe(0)
  })

  it('calculates star graph correctly (center is bridge)', async () => {
    const cache = makeCache(
      ['center', 'A', 'B', 'C'],
      [['center', 'A'], ['center', 'B'], ['center', 'C']]
    )
    const result = await calculateBetweennessCentrality(cache)

    // Center is on all shortest paths between leaf pairs
    expect(result.nodeValues.get('center')).toBeGreaterThan(0)
    // Leaves are never on a shortest path between other pairs
    expect(result.nodeValues.get('A')).toBe(0)
    expect(result.nodeValues.get('B')).toBe(0)
    expect(result.nodeValues.get('C')).toBe(0)
  })

  it('gives zero betweenness for complete graph', async () => {
    // In K4, there's always a direct edge, so no node is a bridge
    const cache = makeCache(
      ['A', 'B', 'C', 'D'],
      [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D']]
    )
    const result = await calculateBetweennessCentrality(cache)

    for (const id of ['A', 'B', 'C', 'D']) {
      expect(result.nodeValues.get(id)).toBe(0)
    }
  })

  it('correctly handles a longer path', async () => {
    // A -- B -- C -- D -- E
    const cache = makeCache(
      ['A', 'B', 'C', 'D', 'E'],
      [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']]
    )
    const result = await calculateBetweennessCentrality(cache)

    // C is the most central (on paths between {A,B} and {D,E})
    const cScore = result.nodeValues.get('C')
    const bScore = result.nodeValues.get('B')
    const dScore = result.nodeValues.get('D')

    // B and D should be symmetric
    expect(bScore).toBeCloseTo(dScore, PRECISION)
    // C should be higher than B
    expect(cScore).toBeGreaterThan(bScore)
    // Endpoints should be 0
    expect(result.nodeValues.get('A')).toBe(0)
    expect(result.nodeValues.get('E')).toBe(0)
  })
})

// --------------------------------------------------------------------------
// Closeness Centrality
// --------------------------------------------------------------------------

describe('Closeness Centrality', () => {
  it('returns empty results for empty graph', async () => {
    const cache = makeCache([], [])
    const result = await calculateClosenessCentrality(cache)
    expect(result.scores).toEqual([])
  })

  it('calculates star graph correctly', async () => {
    const cache = makeCache(
      ['center', 'A', 'B', 'C'],
      [['center', 'A'], ['center', 'B'], ['center', 'C']]
    )
    const result = await calculateClosenessCentrality(cache)

    // Center is closest to all nodes (distance 1 to each)
    const centerCloseness = result.nodeValues.get('center')
    const leafCloseness = result.nodeValues.get('A')

    expect(centerCloseness).toBeGreaterThan(leafCloseness)
  })

  it('gives equal closeness for complete graph', async () => {
    const cache = makeCache(
      ['A', 'B', 'C'],
      [['A', 'B'], ['A', 'C'], ['B', 'C']]
    )
    const result = await calculateClosenessCentrality(cache)

    const a = result.nodeValues.get('A')
    const b = result.nodeValues.get('B')
    const c = result.nodeValues.get('C')

    expect(a).toBeCloseTo(b, PRECISION)
    expect(b).toBeCloseTo(c, PRECISION)
  })

  it('handles isolated node (closeness = 0)', async () => {
    const cache = makeCache(['A', 'B', 'C'], [['A', 'B']])
    const result = await calculateClosenessCentrality(cache)

    // Isolated node C has no paths → closeness 0
    expect(result.nodeValues.get('C')).toBe(0)
  })

  it('center node in path has highest closeness', async () => {
    // A -- B -- C -- D -- E
    const cache = makeCache(
      ['A', 'B', 'C', 'D', 'E'],
      [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']]
    )
    const result = await calculateClosenessCentrality(cache)

    const scores = ['A', 'B', 'C', 'D', 'E'].map(id => result.nodeValues.get(id))
    // C (index 2) should have the highest closeness
    const maxIdx = scores.indexOf(Math.max(...scores))
    expect(maxIdx).toBe(2)
  })
})

// --------------------------------------------------------------------------
// Eigenvector Centrality
// --------------------------------------------------------------------------

describe('Eigenvector Centrality', () => {
  it('returns empty results for empty graph', async () => {
    const cache = makeCache([], [])
    const result = await calculateEigenvectorCentrality(cache)
    expect(result.scores).toEqual([])
  })

  it('gives highest score to most connected node in star', async () => {
    const cache = makeCache(
      ['center', 'A', 'B', 'C', 'D'],
      [['center', 'A'], ['center', 'B'], ['center', 'C'], ['center', 'D']]
    )
    const result = await calculateEigenvectorCentrality(cache)

    // Center should have the highest eigenvector centrality
    expect(result.scores[0].id).toBe('center')
  })

  it('gives equal scores for complete graph', async () => {
    const cache = makeCache(
      ['A', 'B', 'C'],
      [['A', 'B'], ['A', 'C'], ['B', 'C']]
    )
    const result = await calculateEigenvectorCentrality(cache)

    const a = result.nodeValues.get('A')
    const b = result.nodeValues.get('B')
    const c = result.nodeValues.get('C')

    expect(a).toBeCloseTo(b, 4)
    expect(b).toBeCloseTo(c, 4)
  })

  it('gives equal scores for symmetric leaf nodes', async () => {
    const cache = makeCache(
      ['center', 'A', 'B'],
      [['center', 'A'], ['center', 'B']]
    )
    const result = await calculateEigenvectorCentrality(cache)

    const a = result.nodeValues.get('A')
    const b = result.nodeValues.get('B')
    expect(a).toBeCloseTo(b, PRECISION)
  })

  it('returns graph-level metrics with expected keys', async () => {
    const cache = makeCache(['A', 'B'], [['A', 'B']])
    const result = await calculateEigenvectorCentrality(cache)

    expect(result.graphLevelMetrics).toHaveProperty('Maximum Eigenvector Centrality')
    expect(result.graphLevelMetrics).toHaveProperty('Minimum Eigenvector Centrality')
    expect(result.graphLevelMetrics).toHaveProperty('Average Eigenvector Centrality')
    expect(result.graphLevelMetrics).toHaveProperty('Variance Eigenvector Centrality')
    expect(result.graphLevelMetrics).toHaveProperty('Centralization')
  })
})

// --------------------------------------------------------------------------
// PageRank
// --------------------------------------------------------------------------

describe('PageRank', () => {
  it('returns empty results for empty graph', async () => {
    const cache = makeCache([], [])
    const result = await calculatePageRank(cache)
    expect(result.scores).toEqual([])
  })

  it('gives highest PageRank to most connected node in star', async () => {
    const cache = makeCache(
      ['center', 'A', 'B', 'C', 'D'],
      [['center', 'A'], ['center', 'B'], ['center', 'C'], ['center', 'D']]
    )
    const result = await calculatePageRank(cache)

    // Center should have highest PageRank
    expect(result.scores[0].id).toBe('center')
    expect(result.nodeValues.get('center')).toBeGreaterThan(result.nodeValues.get('A'))
  })

  it('gives equal PageRank for complete graph', async () => {
    const cache = makeCache(
      ['A', 'B', 'C'],
      [['A', 'B'], ['A', 'C'], ['B', 'C']]
    )
    const result = await calculatePageRank(cache)

    const a = result.nodeValues.get('A')
    const b = result.nodeValues.get('B')
    const c = result.nodeValues.get('C')

    expect(a).toBeCloseTo(b, 4)
    expect(b).toBeCloseTo(c, 4)
  })

  it('PageRank scores sum to approximately 1', async () => {
    const cache = makeCache(
      ['A', 'B', 'C', 'D', 'E'],
      [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A']]
    )
    const result = await calculatePageRank(cache)

    const sum = Array.from(result.nodeValues.values()).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0, 2)
  })

  it('handles single isolated node', async () => {
    const cache = makeCache(['A'], [])
    const result = await calculatePageRank(cache)

    // Single node gets all the probability mass
    expect(result.nodeValues.get('A')).toBeCloseTo(1.0, 4)
  })

  it('returns correct graph-level metrics', async () => {
    const cache = makeCache(
      ['A', 'B', 'C'],
      [['A', 'B'], ['B', 'C']]
    )
    const result = await calculatePageRank(cache)
    const glm = result.graphLevelMetrics

    expect(glm).toHaveProperty('Maximum PageRank Score')
    expect(glm).toHaveProperty('Minimum PageRank Score')
    expect(glm).toHaveProperty('Mean PageRank Score')
    expect(glm).toHaveProperty('Maximum Degree')
    expect(glm).toHaveProperty('Minimum Degree')
    expect(glm).toHaveProperty('Mean Degree')
  })

  it('symmetric nodes receive equal PageRank', async () => {
    // A -- B -- C   (B is center, A and C are symmetric)
    const cache = makeCache(['A', 'B', 'C'], [['A', 'B'], ['B', 'C']])
    const result = await calculatePageRank(cache)

    expect(result.nodeValues.get('A')).toBeCloseTo(result.nodeValues.get('C'), PRECISION)
  })
})

// --------------------------------------------------------------------------
// Cross-metric consistency checks
// --------------------------------------------------------------------------

describe('Cross-metric consistency', () => {
  it('all metrics agree on highest-centrality node for star graph', async () => {
    const cache = makeCache(
      ['hub', 'A', 'B', 'C', 'D', 'E'],
      [['hub', 'A'], ['hub', 'B'], ['hub', 'C'], ['hub', 'D'], ['hub', 'E']]
    )

    const degree = await calculateDegreeCentrality(cache)
    const betweenness = await calculateBetweennessCentrality(cache)
    const closeness = await calculateClosenessCentrality(cache)
    const eigenvector = await calculateEigenvectorCentrality(cache)
    const pagerank = await calculatePageRank(cache)

    expect(degree.scores[0].id).toBe('hub')
    expect(betweenness.scores[0].id).toBe('hub')
    expect(closeness.scores[0].id).toBe('hub')
    expect(eigenvector.scores[0].id).toBe('hub')
    expect(pagerank.scores[0].id).toBe('hub')
  })

  it('all metrics return nodeValues Map with correct size', async () => {
    const cache = makeCache(
      ['A', 'B', 'C'],
      [['A', 'B'], ['B', 'C']]
    )

    const results = await Promise.all([
      calculateDegreeCentrality(cache),
      calculateBetweennessCentrality(cache),
      calculateClosenessCentrality(cache),
      calculateEigenvectorCentrality(cache),
      calculatePageRank(cache),
    ])

    for (const result of results) {
      expect(result.nodeValues).toBeInstanceOf(Map)
      expect(result.nodeValues.size).toBe(3)
    }
  })
})
