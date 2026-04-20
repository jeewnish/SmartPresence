import { zodResolver } from '@hookform/resolvers/zod'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { z } from 'zod'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { weeklyAttendance } from '../data/mockData'

const reportSchema = z.object({
  type: z.enum(['Course Attendance', 'Student Summary', 'Security Anomalies']),
  from: z.string().min(1, 'From date is required'),
  to: z.string().min(1, 'To date is required'),
  filter: z.string().optional(),
})

type ReportForm = z.infer<typeof reportSchema>

const pieData = [
  { name: 'Present', value: 81, color: '#0ea5e9' },
  { name: 'Late', value: 11, color: '#f59e0b' },
  { name: 'Absent', value: 8, color: '#ef4444' },
]

export function ReportsPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: 'Course Attendance',
      from: '2026-04-01',
      to: '2026-04-21',
      filter: '',
    },
  })

  const selectedType = watch('type')

  const summary = useMemo(() => {
    if (selectedType === 'Security Anomalies') {
      return '14 anomalies detected, 9 resolved, 5 open.'
    }
    if (selectedType === 'Student Summary') {
      return '2,482 active students with 86.7% average attendance.'
    }
    return 'Course attendance across 32 sessions with 88.1% weighted average.'
  }, [selectedType])

  const onSubmit = () => {
    window.alert('Report preview refreshed. Connect this to your reports API endpoint.')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate historical insights with export-ready attendance and security analytics."
      />

      <Card>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Report Generator</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs">
            <span className="mb-1 block font-semibold">Report Type</span>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option>Course Attendance</option>
              <option>Student Summary</option>
              <option>Security Anomalies</option>
            </select>
          </label>

          <label className="text-xs">
            <span className="mb-1 block font-semibold">From</span>
            <input
              type="date"
              {...register('from')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            {errors.from ? <span className="text-rose-500">{errors.from.message}</span> : null}
          </label>

          <label className="text-xs">
            <span className="mb-1 block font-semibold">To</span>
            <input
              type="date"
              {...register('to')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            {errors.to ? <span className="text-rose-500">{errors.to.message}</span> : null}
          </label>

          <label className="text-xs">
            <span className="mb-1 block font-semibold">Optional Course / Department</span>
            <input
              {...register('filter')}
              placeholder="e.g. CIS402 or Computing"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Preview Report
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Download CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        </form>
      </Card>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Preview Summary</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{summary}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance}>
                <XAxis dataKey="day" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attendance Composition</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {pieData.map((entry) => (
              <span key={entry.name} className="rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">
                {entry.name}: {entry.value}%
              </span>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attendance Heatmap (Advanced)</h3>
        <div className="mt-3 grid grid-cols-7 gap-1 text-[10px]">
          {Array.from({ length: 35 }, (_, index) => {
            const intensity = 20 + ((index * 9) % 70)
            return (
              <div
                key={index}
                className="h-7 rounded"
                style={{ backgroundColor: `rgba(14,165,233,${intensity / 100})` }}
              />
            )
          })}
        </div>
      </Card>
    </div>
  )
}
