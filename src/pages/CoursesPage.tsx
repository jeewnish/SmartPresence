import type { ColumnDef } from '@tanstack/react-table'
import { Plus, UserCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import { courses, enrollments, venueBeacons } from '../data/mockData'
import type { Course, VenueBeacon } from '../types/models'

type CourseTab = 'Courses' | 'Venues & Beacons' | 'Enrollments'

export function CoursesPage() {
  const [tab, setTab] = useState<CourseTab>('Courses')
  const [courseForAssign, setCourseForAssign] = useState<Course | null>(null)
  const [selectedBeacon, setSelectedBeacon] = useState<VenueBeacon | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '')
  const [manualStudent, setManualStudent] = useState('')

  const enrollmentRows = useMemo(() => {
    return enrollments.find((item) => item.courseId === selectedCourseId)?.students ?? []
  }, [selectedCourseId])

  const courseColumns = useMemo<ColumnDef<Course, unknown>[]>(
    () => [
      { accessorKey: 'code', header: 'Course Code' },
      { accessorKey: 'name', header: 'Course Name' },
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'credits', header: 'Credits' },
      { accessorKey: 'semester', header: 'Level/Semester' },
      { accessorKey: 'lecturer', header: 'Assigned Lecturer' },
      {
        id: 'health',
        header: 'Attendance Health',
        cell: ({ row }) => (
          <div className="w-32">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-sky-500"
                style={{ width: `${row.original.attendanceHealth}%` }}
              />
            </div>
            <p className="mt-1 text-xs">{row.original.attendanceHealth}%</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => setCourseForAssign(row.original)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
          >
            <UserCheck className="h-3.5 w-3.5" /> Assign Lecturer
          </button>
        ),
      },
    ],
    [],
  )

  const venueColumns = useMemo<ColumnDef<VenueBeacon, unknown>[]>(
    () => [
      { accessorKey: 'venueCode', header: 'Venue Code' },
      { accessorKey: 'venueName', header: 'Venue Name' },
      { accessorKey: 'buildingFloor', header: 'Building/Floor' },
      { accessorKey: 'beaconMac', header: 'Beacon MAC' },
      { accessorKey: 'rssiThreshold', header: 'RSSI Threshold' },
      {
        accessorKey: 'batteryPercent',
        header: 'Battery %',
        cell: ({ row }) => (
          <span className={row.original.batteryPercent < 20 ? 'text-rose-500' : ''}>
            {row.original.batteryPercent}%
          </span>
        ),
      },
      { accessorKey: 'lastHeartbeat', header: 'Last Heartbeat' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'ONLINE'
                ? 'success'
                : row.original.status === 'DEGRADED'
                  ? 'warning'
                  : 'danger'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'detail',
        header: 'Details',
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedBeacon(row.original)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
          >
            Open
          </button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Courses & Venues"
        subtitle="Manage courses, beacon-enabled venues, and student enrollments."
        actions={
          <button className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700">
            <Plus className="h-3.5 w-3.5" /> Add / Edit Course
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(['Courses', 'Venues & Beacons', 'Enrollments'] as CourseTab[]).map((item) => (
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

      {tab === 'Courses' ? (
        <Card>
          <DataTable data={courses} columns={courseColumns} />
        </Card>
      ) : null}

      {tab === 'Venues & Beacons' ? (
        <Card>
          <DataTable data={venueBeacons} columns={venueColumns} />
        </Card>
      ) : null}

      {tab === 'Enrollments' ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>

            <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
              Bulk Upload Students (CSV)
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left">Index</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentRows.map((student) => (
                  <tr key={student.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2">{student.indexNo}</td>
                    <td className="px-3 py-2">{student.fullName}</td>
                    <td className="px-3 py-2">{student.department}</td>
                    <td className="px-3 py-2">
                      <button className="text-xs font-semibold text-rose-600">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={manualStudent}
              onChange={(event) => setManualStudent(event.target.value)}
              placeholder="Search student by index or name"
              className="min-w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">
              Add Student Manually
            </button>
          </div>
        </Card>
      ) : null}

      <Modal
        open={Boolean(courseForAssign)}
        title={`Assign Lecturer - ${courseForAssign?.code ?? ''}`}
        onClose={() => setCourseForAssign(null)}
        widthClassName="max-w-md"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Quick assignment for your assign-lecturer endpoint.
          </p>
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option>Dr. M. Perera</option>
            <option>Ms. A. Silva</option>
            <option>Prof. N. Jayasekara</option>
            <option>Dr. R. Fernando</option>
          </select>
          <button
            onClick={() => setCourseForAssign(null)}
            className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Assign Lecturer
          </button>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedBeacon)}
        title={selectedBeacon ? `${selectedBeacon.venueName} Heartbeat` : 'Beacon Details'}
        onClose={() => setSelectedBeacon(null)}
      >
        {selectedBeacon ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Card className="p-3">MAC: {selectedBeacon.beaconMac}</Card>
              <Card className="p-3">Battery: {selectedBeacon.batteryPercent}%</Card>
            </div>
            <div className="h-64 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedBeacon.heartbeatHistory}>
                  <XAxis dataKey="time" />
                  <YAxis domain={[-100, -50]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="signal" stroke="#0ea5e9" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
