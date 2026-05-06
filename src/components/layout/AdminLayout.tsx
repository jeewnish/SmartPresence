import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { notifications } from '../../data/mockData'
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications'
import { useTheme } from '../../hooks/useTheme'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { items, unreadCount, markAllRead } = useRealtimeNotifications(notifications)
  const sidebarOffsetClass = sidebarCollapsed ? 'lg:pl-[108px]' : 'lg:pl-[276px]'

  return (
    <div className="min-h-screen overflow-x-hidden bg-app-gradient text-slate-700 dark:text-slate-200">
      <TopNavbar
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        notifications={items}
        unreadCount={unreadCount}
        onMarkRead={markAllRead}
      />

      <div className="mx-auto w-full max-w-[1600px] min-w-0 pt-[72px]">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={`min-w-0 overflow-x-hidden px-4 py-5 lg:px-6 ${sidebarOffsetClass}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
