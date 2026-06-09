type StatusBadgeProps = {
  status: string
  className?: string
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  'avslatt': { label: 'Avslått', className: 'badge-red' },
  'innvilget': { label: 'Innvilget', className: 'badge-green' },
  'pagaende': { label: 'Pågående', className: 'badge-amber' },
  'pagar': { label: 'Pågår', className: 'badge-amber' },
  'ikke-startet': { label: 'Ikke startet', className: 'badge-neutral' },
  'fullfort': { label: 'Fullført', className: 'badge-green' },
  'utkast': { label: 'Utkast', className: 'badge-blue' },
  'ferdig': { label: 'Ferdig', className: 'badge-green' },
  'hoy': { label: 'Høy', className: 'badge-red' },
  'middels': { label: 'Middels', className: 'badge-amber' },
  'lav': { label: 'Lav', className: 'badge-neutral' },
  'soknad': { label: 'Søknad', className: 'badge-blue' },
  'notat': { label: 'Notat', className: 'badge-amber' },
  'transkripsjon': { label: 'Transkripsjon', className: 'badge-purple' },
  'strategi': { label: 'Strategi', className: 'badge-green' },
  'epost': { label: 'E-post', className: 'badge-neutral' },
  'arbeidsdok': { label: 'Arbeidsdok', className: 'badge-blue' },
  'duplikat': { label: 'Duplikat', className: 'badge-red' },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, className: 'badge-neutral' }
  return (
    <span className={`${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
