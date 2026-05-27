'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import {
  type Agent,
  CELL,
  COMPANIES,
  GRID,
  createInitialAgents,
  getConcentration,
  stepAgents,
} from '@/lib/emergence-simulation'

export function EmergenceVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stepSeedRef = useRef(0)
  const [agents, setAgents] = useState<Agent[]>(() => createInitialAgents())
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
          stepSeedRef.current += 1
          const next = stepAgents(prev, stepSeedRef.current)
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
    stepSeedRef.current = 0
    setAgents(createInitialAgents())
    setStepCount(0)
  }

  const advanceOneStep = () => {
    stepSeedRef.current += 1
    setAgents(prev => stepAgents(prev, stepSeedRef.current))
    setStepCount(s => s + 1)
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
                onClick={advanceOneStep}
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
      <ChartSource source="Pedagogisk simulering — illustrerer emergente mønstre, ikke empiriske data" />
    </Card>
  )
}
