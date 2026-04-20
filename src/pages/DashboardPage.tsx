import { ArrowDownRight, ArrowUpRight, CircleDashed, Plus, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  activeSessions,
  anomalyAlerts,
  checkInTicker,
  kpis,
  sparklineAttendance,
  systemHealth,
  weeklyAttendance,
} from '../data/mockData'
import type { Alert } from '../types/models'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'

function getHealthVariant(value: 'GREEN' | 'YELLOW' | 'RED') {
  if (value === 'GREEN') return 'success'
  if (value === 'YELLOW') return 'warning'
  return 'danger'
}

export function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>(anomalyAlerts)
  const [healthOpen, setHealthOpen] = useState(false)

  const unresolvedCount = useMemo(
    () => alerts.filter((alert) => !alert.resolved).length,
    [alerts],
  )

  const dashboardKpis = useMemo(() => {
    return kpis.map((kpi) =>
      kpi.label === 'Open Security Flags'
        ? { ...kpi, value: unresolvedCount.toString() }
        : kpi,
    )
  }, [unresolvedCount])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Command Center"
        subtitle="High-level operational visibility for SmartPresence in under 30 seconds."
        actions={
          <>
            <button className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700">
              <Plus className="h-3.5 w-3.5" /> Start New Session
            </button>
            <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <Upload className="h-3.5 w-3.5" /> Import Users (CSV)
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-9">
          {dashboardKpis.map((kpi) => (
            <Card
              key={kpi.label}
              className={kpi.label === 'Active Sessions Right Now' ? 'ring-1 ring-sky-300 dark:ring-sky-700' : ''}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {kpi.label}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {kpi.value}
                </p>
                {kpi.trend ? (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {kpi.trend.direction === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-300">{kpi.trend.value}</span>
                  </div>
                ) : null}
              </div>
              {kpi.label.includes('Attendance') ? (
                <div className="mt-3 h-14 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineAttendance.map((value, index) => ({ index, value }))}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0ea5e9"
                        fill="url(#sparkFill)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
              {kpi.label === 'Open Security Flags' && unresolvedCount > 0 ? (
                <Badge variant={unresolvedCount > 3 ? 'danger' : 'warning'} className="mt-3">
                  {unresolvedCount} unresolved flags
                </Badge>
              ) : null}
            </Card>
          ))}
        </div>

        <Card className="xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">System Health</p>
            <Badge variant={getHealthVariant(systemHealth.overall)}>{systemHealth.overall}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-between">
              BLE Beacons <Badge variant={getHealthVariant(systemHealth.beaconHealth)}>{systemHealth.beaconHealth}</Badge>
            </p>
            <p className="flex items-center justify-between">
              Database <Badge variant={getHealthVariant(systemHealth.database)}>{systemHealth.database}</Badge>
            </p>
            <p className="flex items-center justify-between">
              WebSocket <Badge variant={getHealthVariant(systemHealth.websocket)}>{systemHealth.websocket}</Badge>
            </p>
          </div>
          <button
            onClick={() => setHealthOpen(true)}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View Beacon Details
          </button>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Weekly Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="day" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Recent Anomaly Alerts</h2>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {alerts
              .filter((alert) => !alert.resolved)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {alert.studentName}
                    </p>
                    <Badge
                      variant={
                        alert.severity === 'HIGH'
                          ? 'danger'
                          : alert.severity === 'MEDIUM'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {alert.type} • {alert.time}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{alert.description}</p>
                  <button
                    onClick={() =>
                      setAlerts((prev) =>
                        prev.map((item) =>
                          item.id === alert.id ? { ...item, resolved: true } : item,
                        ),
                      )
                    }
                    className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-300"
                  >
                    Resolve
                  </button>
                </div>
              ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Live Active Sessions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSessions.map((session) => {
              const progress = Math.round((session.checkIns / session.expected) * 100)
              return (
                <Card key={session.id}>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{session.courseCode}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{session.courseName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{session.lecturer}</p>
                  <p className="mt-2 text-xs text-slate-500">{session.venue}</p>
                  <p className="text-xs text-slate-500">
                    Started {session.startedAt} • {session.elapsedMinutes} mins elapsed
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {session.checkIns}/{session.expected} checked in
                  </p>
                  <Link
                    to="/admin/live-sessions"
                    className="mt-3 inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View Session
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex animate-marquee whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
          {[...checkInTicker, ...checkInTicker].map((entry, index) => (
            <span key={`${entry}-${index}`} className="mx-5 inline-flex items-center gap-2">
              <CircleDashed className="h-3.5 w-3.5 text-emerald-500" />
              {entry}
            </span>
          ))}
        </div>
      </section>

      <Modal open={healthOpen} title="Beacon Health Details" onClose={() => setHealthOpen(false)}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Beacon Health</p>
            <p className="mt-1 text-lg font-semibold">98.4%</p>
            <p className="text-xs text-slate-500">45/46 beacons healthy</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Database Latency</p>
            <p className="mt-1 text-lg font-semibold">42 ms</p>
            <p className="text-xs text-slate-500">within target threshold</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">WebSocket Stability</p>
            <p className="mt-1 text-lg font-semibold">96.2%</p>
            <p className="text-xs text-slate-500">minor reconnect spikes</p>
          </Card>
        </div>
      </Modal>
    </div>
  )
}
