import { ArrowDownRight, ArrowUpRight, CircleDashed, Plus, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { coursesApi } from '../api/courses'
import type { ApiCourse } from '../api/courses'
import { beaconsApi } from '../api/beacons'
import type { BeaconStatus } from '../api/beacons'
import { dashboardApi } from '../api/dashboard'
import { reportsApi, securityFlagsApi } from '../api/reports'
import { sessionsApi } from '../api/sessions'
import type { AlertItem, DashboardKpi, ActiveSession } from '../api/dashboard'
import type { AttendancePoint, KPIStat } from '../types/models'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'

export function DashboardPage() {
  const navigate = useNavigate()
  const [kpi, setKpi] = useState<DashboardKpi | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [beacons, setBeacons] = useState<BeaconStatus[]>([])
  const [startModalOpen, setStartModalOpen] = useState(false)
  const [courseId, setCourseId] = useState<number | ''>('')
  const [venueId, setVenueId] = useState<number | ''>('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [weeklyAttendance, setWeeklyAttendance] = useState<AttendancePoint[]>([])
  const [sparklineAttendance, setSparklineAttendance] = useState<number[]>([])
  const [checkInTicker, setCheckInTicker] = useState<string[]>([])
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      const [kpiResult, sessionResult, alertResult] = await Promise.allSettled([
        dashboardApi.getKpis(),
        dashboardApi.getActiveSessions(),
        dashboardApi.getAlerts(),
      ])

      if (!active) return

      const errors: string[] = []

      if (kpiResult.status === 'fulfilled') {
        setKpi(kpiResult.value)
      } else {
        console.error('Failed to load KPIs', kpiResult.reason)
        errors.push('KPIs')
      }

      if (sessionResult.status === 'fulfilled') {
        setSessions(sessionResult.value)
        setCheckInTicker(
          sessionResult.value.map(
            (session) =>
              `${session.courseCode} ${session.courseName} • ${session.studentsCheckedIn} checked in`,
          ),
        )
      } else {
        console.error('Failed to load active sessions', sessionResult.reason)
        errors.push('Active Sessions')
      }

      if (alertResult.status === 'fulfilled') {
        setAlerts(alertResult.value)
      } else {
        console.error('Failed to load alerts', alertResult.reason)
        errors.push('Alerts')
      }

      if (errors.length > 0) {
        setDashboardError(`Could not load: ${errors.join(', ')}. Check the console for details.`)
      } else {
        setDashboardError(null)
      }
    }

    loadDashboard().catch((err) => {
      console.error('Unexpected error loading dashboard', err)
      if (active) setDashboardError('Failed to connect to the server. Is the backend running?')
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    Promise.all([
      coursesApi.getAll({ size: 200 }),
      beaconsApi.getAll(),
    ])
      .then(([coursePage, beaconList]) => {
        if (!active) return
        setCourses(coursePage.content)
        setBeacons(beaconList)
        setCourseId(coursePage.content[0]?.courseId ?? '')
        setVenueId(beaconList[0]?.venueId ?? '')
      })
      .catch((err) => console.error('Failed to load session options', err))

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadWeeklyAttendance = async () => {
      const coursePage = await coursesApi.getAll({ size: 1 })
      const course = coursePage.content[0]
      if (!course) {
        if (active) {
          setWeeklyAttendance([])
          setSparklineAttendance([])
        }
        return
      }

      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 6)

      const formatDate = (value: Date) => value.toISOString().slice(0, 10)
      const rows = await reportsApi.courseAttendance({
        courseId: course.courseId,
        from: formatDate(from),
        to: formatDate(to),
      })

      if (!active) return

      const points = rows.map((row) => {
        const rawDate = typeof row.date === 'string' ? row.date : String(row.date)
        const label = new Date(rawDate).toLocaleDateString('en-US', { weekday: 'short' })
        const present = Number(row.studentsPresent ?? 0)
        return { day: label, percentage: present }
      })

      setWeeklyAttendance(points)
      setSparklineAttendance(points.map((point) => point.percentage))
    }

    loadWeeklyAttendance().catch((err) => {
      console.error('Failed to load attendance report', err)
    })

    return () => {
      active = false
    }
  }, [])

  const dashboardKpis = useMemo<KPIStat[]>(() => {
    if (!kpi) return []

    return [
      { label: 'Active Students', value: String(kpi.totalActiveStudents) },
      { label: 'Today Avg Attendance', value: `${kpi.todayAvgAttendancePct}%` },
      { label: 'Active Sessions Right Now', value: String(kpi.activeSessionsNow) },
      { label: 'Open Security Flags', value: String(kpi.openSecurityFlags) },
    ]
  }, [kpi])

  const handleResolveAlert = async (flagId: number) => {
    try {
      await securityFlagsApi.resolve(flagId, 'Resolved from dashboard')
      setAlerts((prev) => prev.filter((alert) => alert.flagId !== flagId))
    } catch (err) {
      console.error('Failed to resolve alert', err)
    }
  }

  const handleStartSession = async () => {
    if (!courseId) {
      setActionMessage('Select a course before starting a session.')
      return
    }

    try {
      await sessionsApi.start({
        courseId,
        venueId: venueId || undefined,
        durationMinutes,
      })
      const refreshed = await dashboardApi.getActiveSessions()
      setSessions(refreshed)
      setStartModalOpen(false)
      setActionMessage('Session started successfully.')
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to start session.')
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        title="Command Center"
        subtitle="High-level operational visibility for SmartPresence in under 30 seconds."
        actions={
          <>
            <button
              onClick={() => setStartModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              <Plus className="h-3.5 w-3.5" /> Start New Session
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5" /> Import Users (CSV)
            </button>
          </>
        }
      />

      {dashboardError ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <span className="font-semibold">Dashboard error: </span>{dashboardError}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <Card
            key={kpi.label}
            className={
              kpi.label === 'Active Sessions Right Now'
                ? 'flex h-full min-h-[175px] flex-col ring-1 ring-sky-300 dark:ring-sky-700'
                : 'flex h-full min-h-[175px] flex-col'
            }
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {kpi.label}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</p>
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
            {kpi.label.includes('Attendance') && sparklineAttendance.length > 0 ? (
              <div className="mt-auto h-16 w-full pt-4">
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
            {kpi.label === 'Open Security Flags' && kpi.value !== '0' ? (
              <Badge
                variant={Number(kpi.value) > 3 ? 'danger' : 'warning'}
                className="mt-3"
              >
                {kpi.value} unresolved flags
              </Badge>
            ) : null}
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="min-w-0 xl:col-span-8">
          <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Weekly Attendance Trend</h2>
          <div className="h-64 w-full min-w-0">
            {weeklyAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
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
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No attendance data for this period
              </div>
            )}
          </div>
        </Card>

        <Card className="min-w-0 xl:col-span-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Recent Anomaly Alerts</h2>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.flagId}
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
                  {alert.flagType} • {new Date(alert.flaggedAt).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{alert.description}</p>
                <button
                  onClick={() => handleResolveAlert(alert.flagId)}
                  className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-300"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Live Active Sessions</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sessions.map((session) => {
            const progress = session.studentsCheckedIn > 0 ? 100 : 0
            return (
              <Card key={session.sessionId} className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">{session.courseCode}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {session.courseName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{session.lecturerName}</p>
                <p className="mt-2 text-xs text-slate-500">{session.venueName}</p>
                <p className="text-xs text-slate-500">
                  Started {new Date(session.startedAt).toLocaleString()} • {session.elapsedMinutes} mins elapsed
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {session.studentsCheckedIn} checked in
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

      <Modal
        open={startModalOpen}
        title="Start New Session"
        onClose={() => setStartModalOpen(false)}
        widthClassName="max-w-lg"
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Course</span>
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value ? Number(event.target.value) : '')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Venue</span>
            <select
              value={venueId}
              onChange={(event) => setVenueId(event.target.value ? Number(event.target.value) : '')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">No venue</option>
              {beacons.map((beacon) => (
                <option key={beacon.venueId} value={beacon.venueId}>
                  {beacon.venueCode} - {beacon.venueName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Duration: {durationMinutes} minutes</span>
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className="w-full"
            />
          </label>
          {actionMessage ? <p className="text-xs text-slate-500">{actionMessage}</p> : null}
          <button
            onClick={handleStartSession}
            className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Start Session
          </button>
        </div>
      </Modal>
    </div>
  )
}
