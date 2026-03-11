'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/Card'

type Agent = {
  x: number
  y: number
  company: number
  size: number
}

const COMPANIES = [
  { name: 'A', color: '#1565C0' },
  { name: 'B', color: '#E30613' },
  { name: 'C', color: '#4CAF50' },
  { name: 'D', color: '#E91E63' },
  { name: 'E', color: '#F59E0B' },
]

const GRID = 40
const CELL = 8

function initAgents(): Agent[] {
  const agents: Agent[] = []
  for (let i = 0; i < 80; i++) {
    agents.push({
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
      company: Math.floor(Math.random() * COMPANIES.length),
      size: 1,
    })
  }
  return agents
}

function step(agents: Agent[]): Agent[] {
  const grid: Record<string, Agent[]> = {}
  for (const a of agents) {
    const key = `${a.x},${a.y}`
    if (!grid[key]) grid[key] = []
    grid[key].push(a)
  }

  return agents.map(a => {
    const neighbors: Agent[] = []
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue
        const key = `${(a.x + dx + GRID) % GRID},${(a.y + dy + GRID) % GRID}`
        if (grid[key]) neighbors.push(...grid[key])
      }
    }

    const sameCompany = neighbors.filter(n => n.company === a.company).length
    const totalNearby = neighbors.length

    if (totalNearby > 3 && sameCompany < totalNearby * 0.3) {
      const biggest = neighbors.reduce((max, n) => {
        const compCount = neighbors.filter(nn => nn.company === n.company).length
        return compCount > max.count ? { company: n.company, count: compCount } : max
      }, { company: a.company, count: sameCompany })

      if (Math.random() < 0.15) {
        return { ...a, company: biggest.company, size: Math.min(a.size + 0.1, 3) }
      }
    }

    if (sameCompany > totalNearby * 0.5 && a.size < 3) {
      return { ...a, size: Math.min(a.size + 0.05, 3) }
    }

    const dx = Math.floor(Math.random() * 3) - 1
    const dy = Math.floor(Math.random() * 3) - 1
    return {
      ...a,
      x: (a.x + dx + GRID) % GRID,
      y: (a.y + dy + GRID) % GRID,
    }
  })
}

function getConcentration(agents: Agent[]): number[] {
  const counts = new Array(COMPANIES.length).fill(0)
  for (const a of agents) counts[a.company]++
  return counts
}

export function EmergenceVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [agents, setAgents] = useState<Agent[]>(initAgents)
  const [running, setRunning] = useState(false)
  const [stepCount, setStepCount] = useState(0)
  const animRef = useRef<number>(0)

  const draw = useCallback((agentList: Agent[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#fafaf9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#e7e5e4'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, GRID * CELL)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(GRID * CELL, i * CELL)
      ctx.stroke()
    }

    for (const agent of agentList) {
      const company = COMPANIES[agent.company]
      ctx.fillStyle = company.color
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(
        agent.x * CELL + CELL / 2,
        agent.y * CELL + CELL / 2,
        (CELL / 2) * Math.min(agent.size, 2),
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }, [])

  useEffect(() => {
    draw(agents)
  }, [agents, draw])

  useEffect(() => {
    if (!running) return
    let frame = 0
    const tick = () => {
      if (frame % 3 === 0) {
        setAgents(prev => {
          const next = step(prev)
          setStepCount(s => s + 1)
          return next
        })
      }
      frame++
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [running])

  const reset = () => {
    setRunning(false)
    setAgents(initAgents())
    setStepCount(0)
  }

  const concentration = getConcentration(agents)
  const total = agents.length
  const hhi = concentration.reduce((sum, c) => {
    const share = (c / total) * 100
    return sum + share * share
  }, 0)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Emergenssimulering</h3>
      <p className="text-xs text-stone-400 mb-3">
        Pedagogisk simulering: lokale regler &rarr; markedskonsentrasjon
      </p>
      <div className="flex gap-4 items-start">
        <div>
          <canvas
            ref={canvasRef}
            width={GRID * CELL}
            height={GRID * CELL}
            className="border border-stone-200 rounded"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setRunning(!running)}
              className="px-3 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1 text-xs rounded bg-stone-200 text-stone-700 hover:bg-stone-300"
            >
              Nullstill
            </button>
            {!running && (
              <button
                onClick={() => { setAgents(step(agents)); setStepCount(s => s + 1) }}
                className="px-3 py-1 text-xs rounded bg-stone-200 text-stone-700 hover:bg-stone-300"
              >
                Steg
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="text-[10px] text-stone-400 mb-1">Steg: {stepCount} &middot; HHI: {Math.round(hhi)}</p>
          <div className="space-y-1">
            {COMPANIES.map((c, i) => {
              const share = total > 0 ? Math.round((concentration[i] / total) * 100) : 0
              return (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${share}%`, backgroundColor: c.color }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-600 w-7 text-right">{share}%</span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-stone-400 mt-3 leading-relaxed">
            Agenter f&oslash;lger enkle regler: flytt tilfeldig, kopier dominerende nabo med 15% sjanse. Over tid &oslash;ker konsentrasjonen &mdash; emergens fra lokale interaksjoner.
          </p>
        </div>
      </div>
    </Card>
  )
}
