interface StatusMessageProps {
  message: string | null
  className?: string
}

export function StatusMessage({ message, className }: StatusMessageProps) {
  if (!message) return null
  return <p className={className ?? 'text-sm text-slate-500'}>{message}</p>
}
