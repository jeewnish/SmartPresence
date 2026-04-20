import { RotateCw, ShieldAlert, StopCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import { activeSessions, activityEvents, sessionLogs } from '../data/mockData'
import type { ActiveSession } from '../types/models'

export function LiveSessionsPage() {
  const [selected, setSelected] = useState<ActiveSession | null>(null)
  const [manualOverride, setManualOverride] = useState('')
  const [rotationBoost, setRotationBoost] = useState<Record<string, number>>({})

  const logs = useMemo(
    () => (selected ? sessionLogs[selected.id] ?? [] : []),
    [selected],
  )

  const events = useMemo(
    () => (selected ? activityEvents[selected.id] ?? [] : []),
    [selected],
  )

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
                <th className="px-3 py-2 text-left">Token Rotations</th>
                <th className="px-3 py-2 text-left">Checked In</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => {
                const boost = rotationBoost[session.id] ?? 0
                return (
                  <tr key={session.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2 font-semibold">{session.id}</td>
                    <td className="px-3 py-2">
                      {session.courseCode} - {session.courseName}
                    </td>
                    <td className="px-3 py-2">{session.lecturer}</td>
                    <td className="px-3 py-2">{session.venue}</td>
                    <td className="px-3 py-2">{session.startedAt}</td>
                    <td className="px-3 py-2">{session.tokenRotationCount + boost}</td>
                    <td className="px-3 py-2">{session.checkIns}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => setSelected(session)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            setRotationBoost((prev) => ({
                              ...prev,
                              [session.id]: (prev[session.id] ?? 0) + 1,
                            }))
                          }
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
                        >
                          Rotate Token
                        </button>
                        <button className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 dark:border-rose-900">
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
        title={selected ? `Session Detail - ${selected.id}` : 'Session Detail'}
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
                    <p className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">TK-{selected.id}-B3A1</p>
                  </div>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">
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
                        const passed = log.blePassed && log.biometricPassed && log.devicePassed
                        return (
                          <tr key={log.id} className="border-t border-slate-200 dark:border-slate-700">
                            <td className="px-2 py-1">{log.timestamp}</td>
                            <td className="px-2 py-1">
                              {log.studentName} ({log.indexNo})
                            </td>
                            <td className="px-2 py-1">{log.rssi} dBm</td>
                            <td className="px-2 py-1">{log.estimatedDistance}</td>
                            <td className="px-2 py-1">
                              BLE {log.blePassed ? '✓' : 'x'} / Bio {log.biometricPassed ? '✓' : 'x'} / Device {log.devicePassed ? '✓' : 'x'}
                            </td>
                            <td className="px-2 py-1">
                              {passed ? (
                                <Badge variant="success">PASS</Badge>
                              ) : (
                                <span className="text-rose-600">FAIL: {log.failureReason}</span>
                              )}
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
                      key={event.id}
                      className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
                    >
                      <p>{event.message}</p>
                      <p className="mt-1 text-slate-500">{event.time}</p>
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
