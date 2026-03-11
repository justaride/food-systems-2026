export default function KartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 flex-1 relative overflow-hidden" style={{ maxWidth: 'none' }}>
      {children}
    </div>
  )
}
