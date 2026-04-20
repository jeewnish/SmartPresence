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

  return (
    <div className="min-h-screen bg-app-gradient text-slate-700 dark:text-slate-200">
      <TopNavbar
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
        notifications={items}
        unreadCount={unreadCount}
        onMarkRead={markAllRead}
      />

      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="w-full flex-1 px-4 py-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
