'use client'

import { Card } from '@/components/ui/Card'

type Node = { id: string; label: string; x: number; y: number }
type Link = { from: string; to: string; polarity: '+' | '-'; type: 'reinforcing' | 'balancing' }

const NODES: Node[] = [
  { id: 'conc', label: 'Markedskonsentrasjon', x: 300, y: 60 },
  { id: 'power', label: 'Kj\u00F8pekraft', x: 500, y: 140 },
  { id: 'price', label: 'Lavere innkj\u00F8pspris', x: 500, y: 260 },
  { id: 'margin', label: 'H\u00F8yere margin', x: 300, y: 340 },
  { id: 'invest', label: 'Investeringskapasitet', x: 100, y: 260 },
  { id: 'expand', label: 'Ekspansjon', x: 100, y: 140 },
  { id: 'barrier', label: 'Etableringshindre', x: 300, y: 200 },
  { id: 'diversity', label: 'Mangfold', x: 500, y: 340 },
  { id: 'regulation', label: 'Regulering', x: 100, y: 60 },
]

const LINKS: Link[] = [
  { from: 'conc', to: 'power', polarity: '+', type: 'reinforcing' },
  { from: 'power', to: 'price', polarity: '+', type: 'reinforcing' },
  { from: 'price', to: 'margin', polarity: '+', type: 'reinforcing' },
  { from: 'margin', to: 'invest', polarity: '+', type: 'reinforcing' },
  { from: 'invest', to: 'expand', polarity: '+', type: 'reinforcing' },
  { from: 'expand', to: 'conc', polarity: '+', type: 'reinforcing' },
  { from: 'conc', to: 'barrier', polarity: '+', type: 'reinforcing' },
  { from: 'barrier', to: 'diversity', polarity: '-', type: 'balancing' },
  { from: 'conc', to: 'regulation', polarity: '+', type: 'balancing' },
  { from: 'regulation', to: 'conc', polarity: '-', type: 'balancing' },
]

function getNode(id: string): Node {
  return NODES.find(n => n.id === id)!
}

export function CausalLoopDiagram() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Kausalt sløyfediagram</h3>
      <p className="text-xs text-stone-400 mb-3">Konseptuell modell: tilbakekoblingsmekanismer i dagligvaremarkedet</p>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 400" className="w-full max-w-[600px] mx-auto" style={{ minWidth: 400 }}>
          <defs>
            <marker id="arrow-r" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
            <marker id="arrow-b" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>

          {LINKS.map((link, i) => {
            const from = getNode(link.from)
            const to = getNode(link.to)
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            const dx = to.x - from.x
            const dy = to.y - from.y
            const offset = 20
            const cx = mx + (-dy / Math.sqrt(dx * dx + dy * dy)) * offset
            const cy = my + (dx / Math.sqrt(dx * dx + dy * dy)) * offset
            const color = link.type === 'reinforcing' ? '#10b981' : '#ef4444'
            const markerId = link.type === 'reinforcing' ? 'arrow-r' : 'arrow-b'

            return (
              <g key={i}>
                <path
                  d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray={link.type === 'balancing' ? '6 3' : undefined}
                  markerEnd={`url(#${markerId})`}
                  opacity={0.7}
                />
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill={color}>
                  {link.polarity}
                </text>
              </g>
            )
          })}

          {NODES.map(node => (
            <g key={node.id}>
              <rect
                x={node.x - 65}
                y={node.y - 14}
                width={130}
                height={28}
                rx={6}
                fill="white"
                stroke="#d6d3d1"
                strokeWidth={1}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize={10}
                fill="#44403c"
                fontWeight={node.id === 'conc' ? 600 : 400}
              >
                {node.label}
              </text>
            </g>
          ))}

          <g>
            <text x={300} y={390} textAnchor="middle" fontSize={9} fill="#a8a29e">
              <tspan fill="#10b981" fontWeight="bold">&#9472;&#9472;</tspan> Forsterking (R)
              {' '}
              <tspan fill="#ef4444" fontWeight="bold">- - -</tspan> Balansering (B)
            </text>
          </g>
        </svg>
      </div>
    </Card>
  )
}
