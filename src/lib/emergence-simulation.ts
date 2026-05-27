export type Agent = {
  x: number
  y: number
  company: number
  size: number
}

export const COMPANIES = [
  { name: 'A', color: '#1565C0' },
  { name: 'B', color: '#E30613' },
  { name: 'C', color: '#4CAF50' },
  { name: 'D', color: '#E91E63' },
  { name: 'E', color: '#F59E0B' },
]

export const GRID = 40
export const CELL = 8
export const DEFAULT_SIMULATION_SEED = 20260527

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createInitialAgents(count = 80, seed = DEFAULT_SIMULATION_SEED): Agent[] {
  const random = seededRandom(seed)
  const agents: Agent[] = []

  for (let i = 0; i < count; i++) {
    agents.push({
      x: Math.floor(random() * GRID),
      y: Math.floor(random() * GRID),
      company: Math.floor(random() * COMPANIES.length),
      size: 1,
    })
  }

  return agents
}

export function stepAgents(agents: Agent[], seed: number): Agent[] {
  const random = seededRandom(seed)
  const grid: Record<string, Agent[]> = {}

  for (const agent of agents) {
    const key = `${agent.x},${agent.y}`
    if (!grid[key]) grid[key] = []
    grid[key].push(agent)
  }

  return agents.map(agent => {
    const neighbors: Agent[] = []
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue
        const key = `${(agent.x + dx + GRID) % GRID},${(agent.y + dy + GRID) % GRID}`
        if (grid[key]) neighbors.push(...grid[key])
      }
    }

    const sameCompany = neighbors.filter(neighbor => neighbor.company === agent.company).length
    const totalNearby = neighbors.length

    if (totalNearby > 3 && sameCompany < totalNearby * 0.3) {
      const biggest = neighbors.reduce(
        (max, neighbor) => {
          const companyCount = neighbors.filter(other => other.company === neighbor.company).length
          return companyCount > max.count ? { company: neighbor.company, count: companyCount } : max
        },
        { company: agent.company, count: sameCompany }
      )

      if (random() < 0.15) {
        return { ...agent, company: biggest.company, size: Math.min(agent.size + 0.1, 3) }
      }
    }

    if (sameCompany > totalNearby * 0.5 && agent.size < 3) {
      return { ...agent, size: Math.min(agent.size + 0.05, 3) }
    }

    const dx = Math.floor(random() * 3) - 1
    const dy = Math.floor(random() * 3) - 1
    return {
      ...agent,
      x: (agent.x + dx + GRID) % GRID,
      y: (agent.y + dy + GRID) % GRID,
    }
  })
}

export function getConcentration(agents: Agent[]): number[] {
  const counts = new Array(COMPANIES.length).fill(0)
  for (const agent of agents) counts[agent.company]++
  return counts
}
