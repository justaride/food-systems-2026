import Link from 'next/link'
import type { KonsernBoardMember } from '@/lib/queries/konsern'

export function Section5Board({ board }: { board: KonsernBoardMember[] }) {
  if (board.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Styre &amp; interlocks</h2>
        <p className="text-sm text-stone-400 italic">Ingen styremedlemmer registrert</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-3">Styre &amp; interlocks</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
          <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
            <tr>
              <th className="text-left px-3 py-2">Person</th>
              <th className="text-left px-3 py-2">Roller i konsernet</th>
              <th className="text-right px-3 py-2">Annet styreverv</th>
              <th className="text-left px-3 py-2">Profil</th>
            </tr>
          </thead>
          <tbody>
            {board.map(member => (
              <tr key={member.personKey} className="border-b border-stone-100 hover:bg-stone-50 align-top">
                <td className="px-3 py-2">
                  {member.hasProfile ? (
                    <Link
                      href={`/personer/${member.personKey}`}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      {member.personName}
                    </Link>
                  ) : (
                    <span className="font-medium text-stone-800">{member.personName}</span>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.internalInterlock && (
                      <span className="text-xs px-1.5 py-0.5 rounded border bg-violet-50 text-violet-700 border-violet-200">
                        intern interlock
                      </span>
                    )}
                    {member.externalInterlock && (
                      <Link
                        href={`/styremedlemmer?personKey=${member.personKey}`}
                        className="text-xs px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      >
                        ekstern interlock ({member.externalCount})
                      </Link>
                    )}
                  </div>
                </td>

                <td className="px-3 py-2">
                  <ul className="space-y-0.5">
                    {member.konsernCompanies.map(kc => (
                      <li key={kc.companyId} className="flex items-start gap-1 text-xs">
                        <Link
                          href={`/selskap/${kc.companyId}`}
                          className="text-stone-600 hover:text-emerald-700 hover:underline shrink-0"
                        >
                          {kc.companyName}
                        </Link>
                        {kc.role && (
                          <span className="text-stone-400">— {kc.role}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>

                <td className="px-3 py-2 text-right tabular-nums text-stone-500 text-xs">
                  {member.externalInterlock ? member.externalCount : '—'}
                </td>

                <td className="px-3 py-2">
                  {member.hasProfile ? (
                    <Link
                      href={`/personer/${member.personKey}`}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Vis profil
                    </Link>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
