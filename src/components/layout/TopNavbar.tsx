import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import type { NotificationItem } from '../../types/models'
import { Badge } from '../common/Badge'

interface TopNavbarProps {
  onToggleSidebar: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: () => void
}

export function TopNavbar({
  onToggleSidebar,
  theme,
  onToggleTheme,
  notifications,
  unreadCount,
  onMarkRead,
}: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-base leading-tight text-slate-900 dark:text-slate-100">
                SmartPresence
              </p>
              <Badge variant="info" className="mt-0.5 px-2 py-0.5 text-[10px]">
                ADMIN
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-9 py-2 text-sm text-slate-700 outline-none ring-sky-500/40 transition focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            placeholder="Search students, sessions, courses..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <div className="group relative">
            <button
              className="relative rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <div className="invisible absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </p>
                <button
                  onClick={onMarkRead}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-300"
                >
                  Mark all as read
                </button>
              </div>
              <ul className="space-y-2">
                {notifications.slice(0, 4).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
                  >
                    <p className="text-slate-700 dark:text-slate-200">{item.text}</p>
                    <p className="mt-1 text-slate-400">{item.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-2 py-1 dark:border-slate-700">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">
              AU
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Logout <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
