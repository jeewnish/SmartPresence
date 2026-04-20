import {
  Activity,
  BookOpen,
  ChartNoAxesCombined,
  LayoutDashboard,
  RadioTower,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

interface SidebarProps {
  collapsed: boolean
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: BookOpen, label: 'Courses & Venues', to: '/admin/courses' },
  { icon: RadioTower, label: 'Live Sessions', to: '/admin/live-sessions' },
  { icon: ChartNoAxesCombined, label: 'Reports', to: '/admin/reports' },
  { icon: Settings, label: 'Settings', to: '/admin/settings' },
]

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-[72px] hidden h-[calc(100svh-72px)] border-r border-slate-200 bg-white/80 px-3 py-4 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-950/80 lg:block',
        collapsed ? 'w-[92px]' : 'w-[260px]',
      )}
    >
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-sky-100 text-sky-800 shadow-sm dark:bg-sky-900/40 dark:text-sky-100'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  'whitespace-nowrap transition-opacity',
                  collapsed ? 'w-0 opacity-0' : 'opacity-100',
                )}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/80 p-3 text-xs dark:border-sky-900/50 dark:bg-sky-950/40">
        <div className="mb-1 inline-flex items-center gap-1 text-sky-700 dark:text-sky-200">
          <Activity className="h-3.5 w-3.5" />
          System active
        </div>
        {!collapsed && (
          <p className="text-slate-600 dark:text-slate-300">
            12 live sessions, 2 degraded beacons, 5 unresolved flags.
          </p>
        )}
      </div>
    </aside>
  )
}
