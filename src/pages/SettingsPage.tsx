import { Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { auditLogs } from '../data/mockData'

type SettingsTab =
  | 'General'
  | 'BLE Configuration'
  | 'Security'
  | 'Notifications'
  | 'System Logs'

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('General')
  const [rssiThreshold, setRssiThreshold] = useState(-72)
  const [tokenLifetime, setTokenLifetime] = useState(45)
  const [graceMinutes, setGraceMinutes] = useState(8)
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(20)
  const [staleTimeout, setStaleTimeout] = useState(15)
  const [logSearch, setLogSearch] = useState('')

  const filteredLogs = useMemo(
    () =>
      auditLogs.filter((log) =>
        `${log.actor} ${log.action} ${log.entity} ${log.timestamp}`
          .toLowerCase()
          .includes(logSearch.toLowerCase()),
      ),
    [logSearch],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="System Settings"
        subtitle="Technical configuration controls with safe defaults and auditable history."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            'General',
            'BLE Configuration',
            'Security',
            'Notifications',
            'System Logs',
          ] as SettingsTab[]
        ).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              tab === item
                ? 'bg-sky-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab !== 'System Logs' ? (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">BLE RSSI Threshold: {rssiThreshold} dBm</span>
              <input
                type="range"
                min={-85}
                max={-70}
                value={rssiThreshold}
                onChange={(event) => setRssiThreshold(Number(event.target.value))}
                className="w-full"
              />
              <p className="text-xs text-slate-500">-70 strict, -85 relaxed</p>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold">Token Lifetime: {tokenLifetime}s</span>
              <input
                type="range"
                min={20}
                max={120}
                value={tokenLifetime}
                onChange={(event) => setTokenLifetime(Number(event.target.value))}
                className="w-full"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold">Late Grace Minutes: {graceMinutes}m</span>
              <input
                type="range"
                min={0}
                max={20}
                value={graceMinutes}
                onChange={(event) => setGraceMinutes(Number(event.target.value))}
                className="w-full"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold">Low Battery Threshold: {lowBatteryThreshold}%</span>
              <input
                type="range"
                min={5}
                max={40}
                value={lowBatteryThreshold}
                onChange={(event) => setLowBatteryThreshold(Number(event.target.value))}
                className="w-full"
              />
            </label>

            <label className="text-sm lg:col-span-2">
              <span className="mb-1 block font-semibold">Beacon Stale Timeout: {staleTimeout}m</span>
              <input
                type="range"
                min={5}
                max={30}
                value={staleTimeout}
                onChange={(event) => setStaleTimeout(Number(event.target.value))}
                className="w-full"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">
              <Save className="h-3.5 w-3.5" /> Save Settings
            </button>
            <a
              href="/swagger-ui.html"
              target="_blank"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
              rel="noreferrer"
            >
              Open Swagger / OpenAPI
            </a>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
              Manual Database Backup (Future)
            </button>
          </div>
        </Card>
      ) : null}

      {tab === 'System Logs' ? (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Audit Logs</h2>
            <input
              value={logSearch}
              onChange={(event) => setLogSearch(event.target.value)}
              placeholder="Filter by actor or action"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left">Actor</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Entity</th>
                  <th className="px-3 py-2 text-left">Old/New Values (JSON)</th>
                  <th className="px-3 py-2 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2">{log.actor}</td>
                    <td className="px-3 py-2">{log.action}</td>
                    <td className="px-3 py-2">{log.entity}</td>
                    <td className="px-3 py-2 font-mono text-xs">{log.changes}</td>
                    <td className="px-3 py-2">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
