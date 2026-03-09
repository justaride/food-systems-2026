type CardProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="text-sm font-semibold text-neutral-300 mb-3">{title}</h3>}
      {children}
    </div>
  )
}
