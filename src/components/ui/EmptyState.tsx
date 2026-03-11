type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="py-8 text-center text-sm text-stone-400 border border-dashed border-stone-300 rounded-xl">
      {message}
    </div>
  )
}
