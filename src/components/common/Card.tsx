import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-card backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/85',
        className,
      )}
    >
      {children}
    </div>
  )
}
