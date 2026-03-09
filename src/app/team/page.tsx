import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { team } from '@/lib/data/team'
import type { TeamRole } from '@/lib/types'

const ROLE_ORDER: TeamRole[] = ['lead', 'ceo', 'project-leader', 'team', 'partner']

const ROLE_LABELS: Record<TeamRole, string> = {
  'lead': 'Lead',
  'ceo': 'CEO',
  'project-leader': 'Prosjektleder',
  'team': 'Team',
  'partner': 'Partner',
}

const ROLE_BADGE: Record<TeamRole, string> = {
  'lead': 'badge-green',
  'ceo': 'badge-blue',
  'project-leader': 'badge-amber',
  'team': 'badge-neutral',
  'partner': 'badge-purple',
}

const groups = [
  { label: 'Leads', roles: ['lead'] as TeamRole[] },
  { label: 'Ledelse', roles: ['ceo', 'project-leader'] as TeamRole[] },
  { label: 'Team', roles: ['team'] as TeamRole[] },
  { label: 'Partnere', roles: ['partner'] as TeamRole[] },
]

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Team</h1>
        <p className="text-sm text-neutral-500 mt-1">Organisasjon og nokkelpersoner</p>
      </div>

      {groups.map(group => {
        const members = team
          .filter(m => group.roles.includes(m.role))
          .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))

        if (members.length === 0) return null

        return (
          <Card key={group.label} title={group.label}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-400 flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-neutral-200">{member.name}</h4>
                      <span className={ROLE_BADGE[member.role]}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{member.title}</p>
                    <p className="text-xs text-neutral-600">{member.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
