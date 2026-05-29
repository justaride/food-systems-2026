'use client'

type PersonRole = {
  companyId: string | null
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
}

type Props = {
  roles: PersonRole[]
}

const BAR_COLORS = ['#e11d48', '#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#c026d3', '#65a30d']
const CURRENT_YEAR = new Date().getFullYear()
const LABEL_WIDTH = 200
const CHART_WIDTH = 500
const ROW_HEIGHT = 28
const BAR_HEIGHT = 20
const TOP_PADDING = 30

export function RoleTimeline({ roles }: Props) {
  if (roles.length === 0) return null

  const rolesWithYears = roles.filter(r => r.fromYear !== null)
  if (rolesWithYears.length === 0) return null

  const minYear = Math.min(...rolesWithYears.map(r => r.fromYear!))
  const maxYear = CURRENT_YEAR
  const yearSpan = maxYear - minYear || 1

  const totalWidth = LABEL_WIDTH + CHART_WIDTH
  const height = TOP_PADDING + rolesWithYears.length * ROW_HEIGHT + 10

  const years: number[] = []
  const step = yearSpan <= 10 ? 1 : yearSpan <= 30 ? 5 : 10
  for (let y = Math.ceil(minYear / step) * step; y <= maxYear; y += step) {
    years.push(y)
  }
  if (!years.includes(minYear)) years.unshift(minYear)
  if (!years.includes(maxYear)) years.push(maxYear)

  const xScale = (year: number) => LABEL_WIDTH + ((year - minYear) / yearSpan) * CHART_WIDTH

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalWidth} ${height}`}
      className="overflow-visible"
      style={{ maxWidth: totalWidth }}
    >
      {years.map(year => (
        <g key={year}>
          <line
            x1={xScale(year)}
            y1={TOP_PADDING - 5}
            x2={xScale(year)}
            y2={height - 10}
            stroke="#e7e5e4"
            strokeWidth={1}
          />
          <text
            x={xScale(year)}
            y={TOP_PADDING - 12}
            textAnchor="middle"
            fill="#a8a29e"
            fontSize={10}
          >
            {year}
          </text>
        </g>
      ))}

      {rolesWithYears.map((role, i) => {
        if (role.fromYear == null) return null
        const y = TOP_PADDING + i * ROW_HEIGHT
        const from = role.fromYear
        const to = role.toYear ?? CURRENT_YEAR
        const barX = xScale(from)
        const barWidth = Math.max(xScale(to) - xScale(from), 6)
        const color = BAR_COLORS[i % BAR_COLORS.length]
        const isCurrent = role.toYear === null

        return (
          <g key={i} transform={`translate(0, ${y})`}>
            <text
              x={LABEL_WIDTH - 8}
              y={BAR_HEIGHT / 2 + 1}
              textAnchor="end"
              dominantBaseline="central"
              fill="#57534e"
              fontSize={10}
            >
              {truncateLabel(`${role.role} — ${role.companyName}`, 28)}
            </text>
            <rect
              x={barX}
              y={0}
              width={barWidth}
              height={BAR_HEIGHT}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            {isCurrent && (
              <polygon
                points={`${barX + barWidth},${BAR_HEIGHT / 2 - 5} ${barX + barWidth + 8},${BAR_HEIGHT / 2} ${barX + barWidth},${BAR_HEIGHT / 2 + 5}`}
                fill={color}
                opacity={0.6}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function truncateLabel(label: string, maxLen: number): string {
  if (label.length <= maxLen) return label
  return label.slice(0, maxLen - 1) + '\u2026'
}
