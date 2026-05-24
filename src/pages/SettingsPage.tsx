import { Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { auditLogsApi, settingsApi } from '../api/settings'
import type { AuditLogEntry, SystemSetting } from '../api/settings'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { SegmentedTabs } from '../components/common/SegmentedTabs'
import { StatusMessage } from '../components/common/StatusMessage'

interface AuditLogRow {
  id: string
  actor: string
  action: string
  entity: string
  changes: string
  timestamp: string
}

type SettingsTab =
  | 'General'
  | 'BLE Configuration'
  | 'Security'
  | 'Notifications'
  | 'System Logs'

interface SettingsForm {
  lateGraceMinutes: number
  absentThresholdPct: number
  timezone: string
  rssiThreshold: number
  beaconStaleTimeout: number
  broadcastInterval: number
  scanningWindow: number
  tokenLifetime: number
  identityProviderSync: boolean
  identityProviderName: string
  deviceBindingLimit: number
  concurrentSessionLimit: number
  lowBatteryThreshold: number
  absenceWarningAlerts: boolean
  systemFailureAlertEmail: string
  pushEnvironment: 'DEV' | 'PROD'
  pushApiKey: string
}

const tabs: SettingsTab[] = [
  'General',
  'BLE Configuration',
  'Security',
  'Notifications',
  'System Logs',
]

const initialSettings: SettingsForm = {
  lateGraceMinutes: 15,
  absentThresholdPct: 75,
  timezone: 'Asia/Colombo',
  rssiThreshold: -72,
  beaconStaleTimeout: 15,
  broadcastInterval: 5,
  scanningWindow: 10,
  tokenLifetime: 600,
  identityProviderSync: true,
  identityProviderName: 'Keycloak',
  deviceBindingLimit: 1,
  concurrentSessionLimit: 1,
  lowBatteryThreshold: 20,
  absenceWarningAlerts: true,
  systemFailureAlertEmail: 'admin@smartpresence.lk',
  pushEnvironment: 'DEV',
  pushApiKey: 'not-configured',
}

function settingKey(setting: SystemSetting) {
  return setting.key ?? setting.settingKey ?? ''
}

function settingValue(setting: SystemSetting) {
  return setting.value ?? setting.settingValue ?? ''
}

function numeric(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function booleanValue(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/40">
      <span className="mb-1 block font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </span>
      <span className="mb-3 block text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </span>
      {children}
    </label>
  )
}

function textInputClass() {
  return 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500/30 focus:ring dark:border-slate-700 dark:bg-slate-900'
}

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('General')
  const [form, setForm] = useState<SettingsForm>(initialSettings)
  const [logSearch, setLogSearch] = useState('')
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadSettings = async () => {
      const [ble, general, security, notifications] = await Promise.all([
        settingsApi.getByGroup('BLE'),
        settingsApi.getByGroup('GENERAL'),
        settingsApi.getByGroup('SECURITY'),
        settingsApi.getByGroup('NOTIFICATIONS'),
      ])
      const map = new Map<string, string>()
      ;[...ble, ...general, ...security, ...notifications].forEach((setting) => {
        map.set(settingKey(setting), settingValue(setting))
      })

      if (!active) return

      setForm({
        lateGraceMinutes: numeric(map.get('attendance_late_minutes'), initialSettings.lateGraceMinutes),
        absentThresholdPct: numeric(map.get('absent_attendance_threshold_pct'), initialSettings.absentThresholdPct),
        timezone: map.get('timezone') ?? initialSettings.timezone,
        rssiThreshold: numeric(map.get('ble_rssi_threshold_strict'), initialSettings.rssiThreshold),
        beaconStaleTimeout: numeric(map.get('beacon_stale_timeout_minutes'), initialSettings.beaconStaleTimeout),
        broadcastInterval: numeric(map.get('ble_broadcast_interval_seconds'), initialSettings.broadcastInterval),
        scanningWindow: numeric(map.get('ble_scanning_window_seconds'), initialSettings.scanningWindow),
        tokenLifetime: numeric(map.get('ble_token_lifetime_seconds'), initialSettings.tokenLifetime),
        identityProviderSync: booleanValue(map.get('identity_provider_sync_enabled'), initialSettings.identityProviderSync),
        identityProviderName: map.get('identity_provider_name') ?? initialSettings.identityProviderName,
        deviceBindingLimit: numeric(map.get('device_binding_limit'), initialSettings.deviceBindingLimit),
        concurrentSessionLimit: numeric(map.get('concurrent_session_limit'), initialSettings.concurrentSessionLimit),
        lowBatteryThreshold: numeric(map.get('low_battery_threshold_pct'), initialSettings.lowBatteryThreshold),
        absenceWarningAlerts: booleanValue(map.get('absence_warning_alerts_enabled'), initialSettings.absenceWarningAlerts),
        systemFailureAlertEmail: map.get('system_failure_alert_email') ?? initialSettings.systemFailureAlertEmail,
        pushEnvironment: (map.get('push_notification_environment') === 'PROD' ? 'PROD' : 'DEV'),
        pushApiKey: map.get('push_notification_api_key') ?? initialSettings.pushApiKey,
      })
    }

    const loadAuditLogs = async () => {
      const res = await auditLogsApi.getAll({ size: 200 })
      if (!active) return

      setAuditLogs(
        res.content.map((entry: AuditLogEntry) => ({
          id: String(entry.logId),
          actor: `${entry.actor.firstName} ${entry.actor.lastName}`,
          action: entry.action,
          entity: entry.entityType,
          changes: JSON.stringify(entry.newValue ?? entry.oldValue ?? {}),
          timestamp: new Date(entry.performedAt).toLocaleString(),
        })),
      )
    }

    loadSettings().catch((err) => console.error('Failed to load settings', err))
    loadAuditLogs().catch((err) => console.error('Failed to load audit logs', err))

    return () => {
      active = false
    }
  }, [])

  const filteredLogs = useMemo(
    () =>
      auditLogs.filter((log) =>
        `${log.actor} ${log.action} ${log.entity} ${log.timestamp}`
          .toLowerCase()
          .includes(logSearch.toLowerCase()),
      ),
    [auditLogs, logSearch],
  )

  const patchForm = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updatesForTab = () => {
    if (tab === 'General') {
      return [
        ['attendance_late_minutes', String(form.lateGraceMinutes)],
        ['absent_attendance_threshold_pct', String(form.absentThresholdPct)],
        ['timezone', form.timezone],
      ]
    }

    if (tab === 'BLE Configuration') {
      return [
        ['ble_rssi_threshold_strict', String(form.rssiThreshold)],
        ['beacon_stale_timeout_minutes', String(form.beaconStaleTimeout)],
        ['ble_broadcast_interval_seconds', String(form.broadcastInterval)],
        ['ble_scanning_window_seconds', String(form.scanningWindow)],
      ]
    }

    if (tab === 'Security') {
      return [
        ['ble_token_lifetime_seconds', String(form.tokenLifetime)],
        ['identity_provider_sync_enabled', String(form.identityProviderSync)],
        ['identity_provider_name', form.identityProviderName],
        ['device_binding_limit', String(form.deviceBindingLimit)],
        ['concurrent_session_limit', String(form.concurrentSessionLimit)],
      ]
    }

    if (tab === 'Notifications') {
      return [
        ['low_battery_threshold_pct', String(form.lowBatteryThreshold)],
        ['absence_warning_alerts_enabled', String(form.absenceWarningAlerts)],
        ['min_attendance_pct_alert', String(form.absentThresholdPct)],
        ['system_failure_alert_email', form.systemFailureAlertEmail],
        ['push_notification_environment', form.pushEnvironment],
        ['push_notification_api_key', form.pushApiKey],
      ]
    }

    return []
  }

  const handleSave = async () => {
    const updates = updatesForTab()
    if (updates.length === 0) return

    try {
      await Promise.all(updates.map(([key, value]) => settingsApi.update(key, value)))
      setMessage(`${tab} settings saved.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save settings.')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="System Settings"
        subtitle="Configuration controls grouped by policy, BLE proximity, security, and messaging."
      />
      <StatusMessage message={message} />

      <SegmentedTabs items={tabs} value={tab} onChange={setTab} />

      {tab === 'General' ? (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={`Late Grace Period: ${form.lateGraceMinutes}m`} description="Minutes a student can be late before being marked tardy or absent.">
              <input type="range" min={0} max={30} value={form.lateGraceMinutes} onChange={(event) => patchForm('lateGraceMinutes', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label={`Absent Threshold: ${form.absentThresholdPct}%`} description="Percentage of the lecture a student must attend to get credit.">
              <input type="range" min={50} max={100} value={form.absentThresholdPct} onChange={(event) => patchForm('absentThresholdPct', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label="Timezone & Localization" description="Timezone used so server logs match the physical lecture location.">
              <select value={form.timezone} onChange={(event) => patchForm('timezone', event.target.value)} className={textInputClass()}>
                <option value="Asia/Colombo">Asia/Colombo</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
              </select>
            </Field>
          </div>
        </Card>
      ) : null}

      {tab === 'BLE Configuration' ? (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={`BLE RSSI Threshold: ${form.rssiThreshold} dBm`} description="Cutoff signal strength that defines the classroom boundary.">
              <input type="range" min={-90} max={-55} value={form.rssiThreshold} onChange={(event) => patchForm('rssiThreshold', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label={`Beacon Stale Timeout: ${form.beaconStaleTimeout}m`} description="How long the system waits before dropping a silent broadcaster.">
              <input type="range" min={1} max={30} value={form.beaconStaleTimeout} onChange={(event) => patchForm('beaconStaleTimeout', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label={`Broadcast Interval: ${form.broadcastInterval}s`} description="How frequently devices emit their BLE payload.">
              <input type="range" min={1} max={30} value={form.broadcastInterval} onChange={(event) => patchForm('broadcastInterval', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label={`Scanning Window/Duration: ${form.scanningWindow}s`} description="How aggressively receiving devices scan for BLE signals.">
              <input type="range" min={2} max={60} value={form.scanningWindow} onChange={(event) => patchForm('scanningWindow', Number(event.target.value))} className="w-full" />
            </Field>
          </div>
        </Card>
      ) : null}

      {tab === 'Security' ? (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={`Token Lifetime: ${form.tokenLifetime}s`} description="Expiration time for rotating BLE payloads to reduce relay attacks.">
              <input type="range" min={30} max={900} step={30} value={form.tokenLifetime} onChange={(event) => patchForm('tokenLifetime', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label="Identity Provider Sync" description="Authentication server and role-sync status for admin and lecturer access.">
              <div className="flex flex-wrap gap-2">
                <input value={form.identityProviderName} onChange={(event) => patchForm('identityProviderName', event.target.value)} className={`${textInputClass()} flex-1`} />
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                  <input type="checkbox" checked={form.identityProviderSync} onChange={(event) => patchForm('identityProviderSync', event.target.checked)} />
                  Sync enabled
                </label>
              </div>
            </Field>
            <Field label="Device Binding Limits" description="Maximum mobile devices a student account can register concurrently.">
              <input type="number" min={1} max={5} value={form.deviceBindingLimit} onChange={(event) => patchForm('deviceBindingLimit', Number(event.target.value))} className={textInputClass()} />
            </Field>
            <Field label="Concurrent Session Limits" description="Prevents the same account from marking attendance in multiple locations at once.">
              <input type="number" min={1} max={3} value={form.concurrentSessionLimit} onChange={(event) => patchForm('concurrentSessionLimit', Number(event.target.value))} className={textInputClass()} />
            </Field>
          </div>
        </Card>
      ) : null}

      {tab === 'Notifications' ? (
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={`Low Battery Threshold: ${form.lowBatteryThreshold}%`} description="Alerts users before battery level can interrupt BLE broadcasting.">
              <input type="range" min={5} max={50} value={form.lowBatteryThreshold} onChange={(event) => patchForm('lowBatteryThreshold', Number(event.target.value))} className="w-full" />
            </Field>
            <Field label="Absence/Warning Alerts" description="Automatically email students when attendance drops below the required percentage.">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                <input type="checkbox" checked={form.absenceWarningAlerts} onChange={(event) => patchForm('absenceWarningAlerts', event.target.checked)} />
                Enabled at {form.absentThresholdPct}%
              </label>
            </Field>
            <Field label="System Failure Alerts" description="Email or webhook target for backend admin alerts when scheduled attendance fails.">
              <input value={form.systemFailureAlertEmail} onChange={(event) => patchForm('systemFailureAlertEmail', event.target.value)} className={textInputClass()} />
            </Field>
            <Field label="Push Notification Config" description="API key and environment for the mobile app push notification service.">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
                <select value={form.pushEnvironment} onChange={(event) => patchForm('pushEnvironment', event.target.value as SettingsForm['pushEnvironment'])} className={textInputClass()}>
                  <option value="DEV">Dev</option>
                  <option value="PROD">Prod</option>
                </select>
                <input value={form.pushApiKey} onChange={(event) => patchForm('pushApiKey', event.target.value)} className={textInputClass()} />
              </div>
            </Field>
          </div>
        </Card>
      ) : null}

      {tab !== 'System Logs' ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
          >
            <Save className="h-3.5 w-3.5" /> Save {tab}
          </button>
          <a
            href="/api/v1/swagger-ui.html"
            target="_blank"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            rel="noreferrer"
          >
            Open Swagger / OpenAPI
          </a>
        </div>
      ) : null}

      {tab === 'System Logs' ? (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Audit Logs</h2>
            <input
              value={logSearch}
              onChange={(event) => setLogSearch(event.target.value)}
              placeholder="Filter by actor or action"
              className={textInputClass()}
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
