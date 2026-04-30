type CardProps = {
  id?: string
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ id, title, children, className = '' }: CardProps) {
  return (
    <div id={id} className={`card ${className}`}>
      {title && <h3 className="text-sm font-semibold text-stone-700 mb-3">{title}</h3>}
      {children}
    </div>
  )
}
