import { cn } from '../../lib/cn'

interface SegmentedTabsProps<T extends string> {
  items: readonly T[]
  value: T
  onChange: (value: T) => void
  getLabel?: (item: T) => string
  className?: string
  buttonClassName?: string
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  getLabel,
  className,
  buttonClassName,
}: SegmentedTabsProps<T>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold',
            value === item
              ? 'bg-sky-600 text-white'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
            buttonClassName,
          )}
        >
          {getLabel ? getLabel(item) : item}
        </button>
      ))}
    </div>
  )
}
