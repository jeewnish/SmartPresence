import { RotateCw, ShieldAlert, StopCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { bleApi } from '../api/ble'
import { dashboardApi } from '../api/dashboard'
import { sessionsApi } from '../api/sessions'
import type { ActiveSession } from '../api/dashboard'
import type { AttendanceRecord } from '../api/sessions'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import type { BleBroadcastEvent } from '../api/ble'

export function LiveSessionsPage() {
  const [selected, setSelected] = useState<ActiveSession | null>(null)
  const [manualOverride, setManualOverride] = useState('')
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([])
  const [bleEvents, setBleEvents] = useState<BleBroadcastEvent[]>([])

  useEffect(() => {
    let active = true

    dashboardApi
      .getActiveSessions()
      .then((res) => {
        if (!active) return
        setSessions(res)
      })
      .catch((err) => console.error('Failed to load active sessions', err))

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selected) return

    sessionsApi
      .getAttendance(selected.sessionId)
      .then((res) => setAttendanceLogs(res))
      .catch((err) => console.error('Failed to load attendance records', err))

    bleApi
      .getEventLog(selected.sessionId)
      .then((res) => setBleEvents(res))
      .catch((err) => console.error('Failed to load BLE events', err))
  }, [selected])

  const logs = useMemo(() => attendanceLogs, [attendanceLogs])
  const events = useMemo(() => bleEvents, [bleEvents])

  const handleRotateToken = async (sessionId: number) => {
    try {
      await bleApi.rotateToken(sessionId)
      const refreshed = await bleApi.getEventLog(sessionId)
      setBleEvents(refreshed)
    } catch (err) {
      console.error('Failed to rotate token', err)
    }
  }

  const handleForceEnd = async (sessionId: number) => {
    try {
      await sessionsApi.forceEnd(sessionId, 'Admin forced end')
      const refreshed = await dashboardApi.getActiveSessions()
      setSessions(refreshed)
      if (selected?.sessionId === sessionId) {
        setSelected(null)
      }
    } catch (err) {
      console.error('Failed to force end session', err)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Sessions Monitor"
        subtitle="Deep real-time BLE session visibility, token control, and emergency interventions."
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-left">Session ID</th>
                <th className="px-3 py-2 text-left">Course</th>
                <th className="px-3 py-2 text-left">Lecturer</th>
                <th className="px-3 py-2 text-left">Venue</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">Minutes Left</th>
                <th className="px-3 py-2 text-left">Checked In</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                return (
                  <tr key={session.sessionId} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2 font-semibold">{session.sessionId}</td>
                    <td className="px-3 py-2">
                      {session.courseCode} - {session.courseName}
                    </td>
                    <td className="px-3 py-2">{session.lecturerName}</td>
                    <td className="px-3 py-2">{session.venueName}</td>
                    <td className="px-3 py-2">{new Date(session.startedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{session.remainingMinutes}</td>
                    <td className="px-3 py-2">{session.studentsCheckedIn}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => setSelected(session)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRotateToken(session.sessionId)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          Rotate Token
                        </button>
                        <button
                          onClick={() => handleForceEnd(session.sessionId)}
                          className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-900"
                        >
                          Force End
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Session Detail - ${selected.sessionId}` : 'Session Detail'}
        onClose={() => setSelected(null)}
        widthClassName="max-w-6xl"
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">BLE Token</p>
                    <p className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
                      Session {selected.sessionId}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRotateToken(selected.sessionId)}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Manual Rotate
                  </button>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Proximity Filter Log / Live Check-ins</h3>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-2 py-1 text-left">Timestamp</th>
                        <th className="px-2 py-1 text-left">Student</th>
                        <th className="px-2 py-1 text-left">RSSI</th>
                        <th className="px-2 py-1 text-left">Distance</th>
                        <th className="px-2 py-1 text-left">Verification</th>
                        <th className="px-2 py-1 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        return (
                          <tr key={log.attendanceId} className="border-t border-slate-200 dark:border-slate-700">
                            <td className="px-2 py-1">{log.checkedInAt ?? '-'}</td>
                            <td className="px-2 py-1">
                              {log.studentName} ({log.indexNumber})
                            </td>
                            <td className="px-2 py-1">-</td>
                            <td className="px-2 py-1">-</td>
                            <td className="px-2 py-1">-</td>
                            <td className="px-2 py-1">
                              <Badge variant={log.status === 'PRESENT' ? 'success' : 'warning'}>
                                {log.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Live Activity Stream</h3>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.eventId}
                      className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
                    >
                      <p>{event.eventType}</p>
                      <p className="mt-1 text-slate-500">
                        {new Date(event.tokenIssuedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Emergency Controls</h3>
                <div className="space-y-2">
                  <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
                    <StopCircle className="h-3.5 w-3.5" /> Force End Session
                  </button>
                  <textarea
                    value={manualOverride}
                    onChange={(event) => setManualOverride(event.target.value)}
                    placeholder="Manual override notes"
                    className="h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                    <ShieldAlert className="h-3.5 w-3.5" /> Apply Override
                  </button>
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
