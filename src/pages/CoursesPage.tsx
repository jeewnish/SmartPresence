import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, UserCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { beaconsApi } from '../api/beacons'
import { coursesApi } from '../api/courses'
import type { ApiCourse, CourseUpsertPayload } from '../api/courses'
import { departmentsApi } from '../api/departments'
import type { ApiDepartment } from '../api/departments'
import { usersApi } from '../api/users'
import type { ApiUser } from '../api/users'
import { venuesApi } from '../api/venues'
import type { ApiVenue, VenueUpsertPayload } from '../api/venues'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import { SegmentedTabs } from '../components/common/SegmentedTabs'
import { StatusMessage } from '../components/common/StatusMessage'

interface CourseRow {
  id: number
  code: string
  name: string
  departmentId: number | ''
  department: string
  credits: number
  level: number
  semesterNumber: number
  semester: string
  academicYear: number
  description: string
  isActive: boolean
  lecturer: string
  attendanceHealth: number
}

interface BeaconRow {
  id: number
  venueCode: string
  venueName: string
  building: string
  floor: number | ''
  capacity: number | ''
  buildingFloor: string
  beaconMac: string
  beaconUuid: string
  rssiThreshold: number
  isActive: boolean
  batteryPercent: number
  lastHeartbeat: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN'
  heartbeatHistory: Array<{ time: string; signal: number }>
}

interface EnrollmentRow {
  id: number
  indexNo: string
  fullName: string
  department: string
}

type CourseTab = 'Courses' | 'Venues & Beacons' | 'Enrollments'
type ModalMode = 'create' | 'edit'

type CourseDraft = {
  courseCode: string
  courseName: string
  departmentId: number | ''
  creditHours: number
  level: number
  semester: number
  academicYear: number
  description: string
  isActive: boolean
}

type VenueDraft = {
  venueCode: string
  venueName: string
  building: string
  floor: number | ''
  capacity: number | ''
  beaconMac: string
  beaconUuid: string
  rssiThreshold: number
  isActive: boolean
}

const currentYear = new Date().getFullYear()

const emptyCourseDraft = (departmentId: number | '' = ''): CourseDraft => ({
  courseCode: '',
  courseName: '',
  departmentId,
  creditHours: 3,
  level: 4,
  semester: 1,
  academicYear: currentYear,
  description: '',
  isActive: true,
})

const emptyVenueDraft = (): VenueDraft => ({
  venueCode: '',
  venueName: '',
  building: '',
  floor: '',
  capacity: '',
  beaconMac: '',
  beaconUuid: '',
  rssiThreshold: -70,
  isActive: true,
})

const toCourseRow = (course: ApiCourse): CourseRow => ({
  id: course.courseId,
  code: course.courseCode,
  name: course.courseName,
  departmentId: course.department?.departmentId ?? '',
  department: course.department?.name ?? course.department?.departmentName ?? 'N/A',
  credits: course.creditHours,
  level: course.level,
  semesterNumber: course.semester,
  semester: `${course.level}/${course.semester}`,
  academicYear: course.academicYear,
  description: course.description ?? '',
  isActive: course.isActive,
  lecturer: 'Unassigned',
  attendanceHealth: 0,
})

const toCourseDraft = (course: CourseRow): CourseDraft => ({
  courseCode: course.code,
  courseName: course.name,
  departmentId: course.departmentId,
  creditHours: course.credits,
  level: course.level,
  semester: course.semesterNumber,
  academicYear: course.academicYear,
  description: course.description,
  isActive: course.isActive,
})

const toVenueDraft = (venue: BeaconRow): VenueDraft => ({
  venueCode: venue.venueCode,
  venueName: venue.venueName,
  building: venue.building,
  floor: venue.floor,
  capacity: venue.capacity,
  beaconMac: venue.beaconMac,
  beaconUuid: venue.beaconUuid,
  rssiThreshold: venue.rssiThreshold,
  isActive: venue.isActive,
})

export function CoursesPage() {
  const [tab, setTab] = useState<CourseTab>('Courses')
  const [courseForAssign, setCourseForAssign] = useState<CourseRow | null>(null)
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconRow | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('')
  const [manualStudent, setManualStudent] = useState('')
  const [courseRows, setCourseRows] = useState<CourseRow[]>([])
  const [beaconRows, setBeaconRows] = useState<BeaconRow[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [lecturers, setLecturers] = useState<ApiUser[]>([])
  const [lecturerId, setLecturerId] = useState<number | ''>('')
  const [message, setMessage] = useState<string | null>(null)
  const [courseModalMode, setCourseModalMode] = useState<ModalMode | null>(null)
  const [courseDraft, setCourseDraft] = useState<CourseDraft>(() => emptyCourseDraft())
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [courseSaving, setCourseSaving] = useState(false)
  const [venueModalMode, setVenueModalMode] = useState<ModalMode | null>(null)
  const [venueDraft, setVenueDraft] = useState<VenueDraft>(() => emptyVenueDraft())
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null)
  const [venueSaving, setVenueSaving] = useState(false)

  useEffect(() => {
    let active = true

    const loadCourses = async () => {
      const res = await coursesApi.getAll({ size: 200 })
      const rows: CourseRow[] = res.content.map(toCourseRow)

      if (!active) return
      setCourseRows(rows)
      setSelectedCourseId(rows[0]?.id ?? '')
    }

    const loadVenues = async () => {
      const [venuePage, beaconStatuses] = await Promise.all([
        venuesApi.getAll({ size: 200 }),
        beaconsApi.getAll().catch(() => []),
      ])
      const statusByVenue = new Map(beaconStatuses.map((beacon) => [beacon.venueId, beacon]))
      const rows: BeaconRow[] = venuePage.content.map((venue: ApiVenue) => {
        const beacon = statusByVenue.get(venue.venueId)
        return {
          id: venue.venueId,
          venueCode: venue.venueCode,
          venueName: venue.venueName,
          building: venue.building ?? '',
          floor: venue.floor ?? '',
          capacity: venue.capacity ?? '',
          buildingFloor: [venue.building, venue.floor != null ? `Floor ${venue.floor}` : null]
            .filter(Boolean)
            .join(' / ') || 'N/A',
          beaconMac: venue.beaconMac ?? beacon?.beaconMac ?? '',
          beaconUuid: venue.beaconUuid ?? '',
          rssiThreshold: venue.rssiThreshold,
          isActive: venue.isActive,
          batteryPercent: beacon?.batteryPct ?? 0,
          lastHeartbeat: beacon?.lastHeartbeatAt
          ? new Date(beacon.lastHeartbeatAt).toLocaleString()
          : 'N/A',
          status: beacon?.status ?? 'UNKNOWN',
          heartbeatHistory: [],
        }
      })

      if (!active) return
      setBeaconRows(rows)
    }

    const loadDepartments = async () => {
      const res = await departmentsApi.getAll({ isActive: true })
      if (!active) return
      setDepartments(res)
      setCourseDraft((prev) => ({
        ...prev,
        departmentId: prev.departmentId || res[0]?.departmentId || '',
      }))
    }

    const loadLecturers = async () => {
      const res = await usersApi.search({ role: 'LECTURER', isActive: true, size: 200 })
      if (!active) return
      setLecturers(res.content)
      setLecturerId(res.content[0]?.userId ?? '')
    }

    loadCourses().catch((err) => console.error('Failed to load courses', err))
    loadVenues().catch((err) => console.error('Failed to load venues', err))
    loadDepartments().catch((err) => console.error('Failed to load departments', err))
    loadLecturers().catch((err) => console.error('Failed to load lecturers', err))

    return () => {
      active = false
    }
  }, [])

  const enrollmentRows = useMemo<EnrollmentRow[]>(() => [], [])

  const handleAssignLecturer = async () => {
    if (!courseForAssign || !lecturerId) return

    try {
      await coursesApi.assignLecturer(courseForAssign.id, lecturerId)
      const lecturer = lecturers.find((item) => item.userId === lecturerId)
      setCourseRows((prev) =>
        prev.map((course) =>
          course.id === courseForAssign.id
            ? {
                ...course,
                lecturer: lecturer
                  ? `${lecturer.firstName} ${lecturer.lastName}`
                  : 'Assigned',
              }
            : course,
        ),
      )
      setCourseForAssign(null)
      setMessage('Lecturer assigned successfully.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to assign lecturer.')
    }
  }

  const openCreateCourse = () => {
    setEditingCourseId(null)
    setCourseDraft(emptyCourseDraft(departments[0]?.departmentId ?? ''))
    setCourseModalMode('create')
    setMessage(null)
  }

  const openEditCourse = (course: CourseRow) => {
    setEditingCourseId(course.id)
    setCourseDraft(toCourseDraft(course))
    setCourseModalMode('edit')
    setMessage(null)
  }

  const handleSaveCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!courseDraft.departmentId) {
      setMessage('Select a department before saving the course.')
      return
    }

    const payload: CourseUpsertPayload = {
      courseCode: courseDraft.courseCode.trim(),
      courseName: courseDraft.courseName.trim(),
      departmentId: courseDraft.departmentId,
      creditHours: Number(courseDraft.creditHours),
      level: Number(courseDraft.level),
      semester: Number(courseDraft.semester),
      academicYear: Number(courseDraft.academicYear),
      description: courseDraft.description.trim() || null,
      isActive: courseDraft.isActive,
    }

    try {
      setCourseSaving(true)
      const saved =
        courseModalMode === 'edit' && editingCourseId
          ? await coursesApi.update(editingCourseId, payload)
          : await coursesApi.create(payload)
      const row = toCourseRow(saved)
      setCourseRows((prev) =>
        courseModalMode === 'edit'
          ? prev.map((course) =>
              course.id === row.id
                ? { ...row, lecturer: course.lecturer, attendanceHealth: course.attendanceHealth }
                : course,
            )
          : [row, ...prev],
      )
      setSelectedCourseId((prev) => prev || row.id)
      setCourseModalMode(null)
      setMessage(`Course ${courseModalMode === 'edit' ? 'updated' : 'created'} successfully.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save course.')
    } finally {
      setCourseSaving(false)
    }
  }

  const openCreateVenue = () => {
    setEditingVenueId(null)
    setVenueDraft(emptyVenueDraft())
    setVenueModalMode('create')
    setMessage(null)
  }

  const openEditVenue = (venue: BeaconRow) => {
    setEditingVenueId(venue.id)
    setVenueDraft(toVenueDraft(venue))
    setVenueModalMode('edit')
    setMessage(null)
  }

  const toVenueRow = (venue: ApiVenue, existing?: BeaconRow): BeaconRow => ({
    id: venue.venueId,
    venueCode: venue.venueCode,
    venueName: venue.venueName,
    building: venue.building ?? '',
    floor: venue.floor ?? '',
    capacity: venue.capacity ?? '',
    buildingFloor: [venue.building, venue.floor != null ? `Floor ${venue.floor}` : null]
      .filter(Boolean)
      .join(' / ') || 'N/A',
    beaconMac: venue.beaconMac ?? '',
    beaconUuid: venue.beaconUuid ?? '',
    rssiThreshold: venue.rssiThreshold,
    isActive: venue.isActive,
    batteryPercent: existing?.batteryPercent ?? 0,
    lastHeartbeat: existing?.lastHeartbeat ?? 'N/A',
    status: existing?.status ?? 'UNKNOWN',
    heartbeatHistory: existing?.heartbeatHistory ?? [],
  })

  const handleSaveVenue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: VenueUpsertPayload = {
      venueCode: venueDraft.venueCode.trim(),
      venueName: venueDraft.venueName.trim(),
      building: venueDraft.building.trim() || null,
      floor: venueDraft.floor === '' ? null : Number(venueDraft.floor),
      capacity: venueDraft.capacity === '' ? null : Number(venueDraft.capacity),
      beaconMac: venueDraft.beaconMac.trim() || null,
      beaconUuid: venueDraft.beaconUuid.trim() || null,
      rssiThreshold: Number(venueDraft.rssiThreshold),
      isActive: venueDraft.isActive,
    }

    try {
      setVenueSaving(true)
      const saved =
        venueModalMode === 'edit' && editingVenueId
          ? await venuesApi.update(editingVenueId, payload)
          : await venuesApi.create(payload)
      const existing = beaconRows.find((venue) => venue.id === saved.venueId)
      const row = toVenueRow(saved, existing)
      setBeaconRows((prev) =>
        venueModalMode === 'edit'
          ? prev.map((venue) => (venue.id === row.id ? row : venue))
          : [row, ...prev],
      )
      setVenueModalMode(null)
      setMessage(`Venue ${venueModalMode === 'edit' ? 'updated' : 'created'} successfully.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save venue.')
    } finally {
      setVenueSaving(false)
    }
  }

  const courseColumns = useMemo<ColumnDef<CourseRow, unknown>[]>(
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openEditCourse(row.original)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => setCourseForAssign(row.original)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
            >
              <UserCheck className="h-3.5 w-3.5" /> Assign
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const venueColumns = useMemo<ColumnDef<BeaconRow, unknown>[]>(
    () => [
      { accessorKey: 'venueCode', header: 'Venue Code' },
      { accessorKey: 'venueName', header: 'Venue Name' },
      { accessorKey: 'buildingFloor', header: 'Building/Floor' },
      { accessorKey: 'beaconMac', header: 'Beacon MAC' },
      { accessorKey: 'rssiThreshold', header: 'RSSI Self Check' },
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openEditVenue(row.original)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => setSelectedBeacon(row.original)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-700"
            >
              Open
            </button>
          </div>
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
          <button
            onClick={tab === 'Venues & Beacons' ? openCreateVenue : openCreateCourse}
            disabled={tab === 'Enrollments'}
            title={tab === 'Enrollments' ? 'Use the course or venue tabs to add records.' : undefined}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />{' '}
            {tab === 'Venues & Beacons' ? 'Add Venue' : 'Add Course'}
          </button>
        }
      />
      <StatusMessage message={message} />

      <SegmentedTabs
        items={['Courses', 'Venues & Beacons', 'Enrollments'] as const}
        value={tab}
        onChange={setTab}
      />

      {tab === 'Courses' ? (
        <Card>
          <DataTable data={courseRows} columns={courseColumns} />
        </Card>
      ) : null}

      {tab === 'Venues & Beacons' ? (
        <Card>
          <DataTable data={beaconRows} columns={venueColumns} />
        </Card>
      ) : null}

      {tab === 'Enrollments' ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(event.target.value ? Number(event.target.value) : '')
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {courseRows.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>

            <button
              disabled
              title="The backend does not expose enrollment import endpoints yet."
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold opacity-50 dark:border-slate-700"
            >
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
                      <button
                        disabled
                        title="The backend does not expose enrollment removal endpoints yet."
                        className="text-xs font-semibold text-rose-600 opacity-50"
                      >
                        Remove
                      </button>
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
            <button
              disabled
              title="The backend does not expose enrollment creation endpoints yet."
              className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white opacity-50"
            >
              Add Student Manually
            </button>
          </div>
        </Card>
      ) : null}

      <Modal
        open={Boolean(courseModalMode)}
        title={`${courseModalMode === 'edit' ? 'Edit' : 'Add'} Course`}
        onClose={() => setCourseModalMode(null)}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Course Code
              <input
                value={courseDraft.courseCode}
                onChange={(event) =>
                  setCourseDraft((prev) => ({ ...prev, courseCode: event.target.value }))
                }
                required
                maxLength={15}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Course Name
              <input
                value={courseDraft.courseName}
                onChange={(event) =>
                  setCourseDraft((prev) => ({ ...prev, courseName: event.target.value }))
                }
                required
                maxLength={150}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Department
              <select
                value={courseDraft.departmentId}
                onChange={(event) =>
                  setCourseDraft((prev) => ({
                    ...prev,
                    departmentId: event.target.value ? Number(event.target.value) : '',
                  }))
                }
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.departmentId} value={department.departmentId}>
                    {department.name ?? department.departmentName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Academic Year
              <input
                type="number"
                value={courseDraft.academicYear}
                onChange={(event) =>
                  setCourseDraft((prev) => ({
                    ...prev,
                    academicYear: Number(event.target.value),
                  }))
                }
                min={2000}
                max={2100}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Credits
              <input
                type="number"
                value={courseDraft.creditHours}
                onChange={(event) =>
                  setCourseDraft((prev) => ({
                    ...prev,
                    creditHours: Number(event.target.value),
                  }))
                }
                min={1}
                max={12}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Level
                <input
                  type="number"
                  value={courseDraft.level}
                  onChange={(event) =>
                    setCourseDraft((prev) => ({ ...prev, level: Number(event.target.value) }))
                  }
                  min={1}
                  max={10}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Semester
                <input
                  type="number"
                  value={courseDraft.semester}
                  onChange={(event) =>
                    setCourseDraft((prev) => ({
                      ...prev,
                      semester: Number(event.target.value),
                    }))
                  }
                  min={1}
                  max={2}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Description
            <textarea
              value={courseDraft.description}
              onChange={(event) =>
                setCourseDraft((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={courseDraft.isActive}
              onChange={(event) =>
                setCourseDraft((prev) => ({ ...prev, isActive: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCourseModalMode(null)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={courseSaving}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {courseSaving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(venueModalMode)}
        title={`${venueModalMode === 'edit' ? 'Edit' : 'Add'} Venue`}
        onClose={() => setVenueModalMode(null)}
      >
        <form onSubmit={handleSaveVenue} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Venue Code
              <input
                value={venueDraft.venueCode}
                onChange={(event) =>
                  setVenueDraft((prev) => ({ ...prev, venueCode: event.target.value }))
                }
                required
                maxLength={20}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Venue Name
              <input
                value={venueDraft.venueName}
                onChange={(event) =>
                  setVenueDraft((prev) => ({ ...prev, venueName: event.target.value }))
                }
                required
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Building
              <input
                value={venueDraft.building}
                onChange={(event) =>
                  setVenueDraft((prev) => ({ ...prev, building: event.target.value }))
                }
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Floor
                <input
                  type="number"
                  value={venueDraft.floor}
                  onChange={(event) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      floor: event.target.value ? Number(event.target.value) : '',
                    }))
                  }
                  min={-10}
                  max={200}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Capacity
                <input
                  type="number"
                  value={venueDraft.capacity}
                  onChange={(event) =>
                    setVenueDraft((prev) => ({
                      ...prev,
                      capacity: event.target.value ? Number(event.target.value) : '',
                    }))
                  }
                  min={1}
                  max={1000}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            </div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Beacon MAC
              <input
                value={venueDraft.beaconMac}
                onChange={(event) =>
                  setVenueDraft((prev) => ({ ...prev, beaconMac: event.target.value }))
                }
                maxLength={17}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Beacon UUID
              <input
                value={venueDraft.beaconUuid}
                onChange={(event) =>
                  setVenueDraft((prev) => ({ ...prev, beaconUuid: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              RSSI Threshold
              <input
                type="number"
                value={venueDraft.rssiThreshold}
                onChange={(event) =>
                  setVenueDraft((prev) => ({
                    ...prev,
                    rssiThreshold: Number(event.target.value),
                  }))
                }
                min={-120}
                max={-20}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={venueDraft.isActive}
              onChange={(event) =>
                setVenueDraft((prev) => ({ ...prev, isActive: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setVenueModalMode(null)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={venueSaving}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {venueSaving ? 'Saving...' : 'Save Venue'}
            </button>
          </div>
        </form>
      </Modal>

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
          <select
            value={lecturerId}
            onChange={(event) => setLecturerId(event.target.value ? Number(event.target.value) : '')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {lecturers.map((lecturer) => (
              <option key={lecturer.userId} value={lecturer.userId}>
                {lecturer.firstName} {lecturer.lastName} - {lecturer.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignLecturer}
            disabled={!lecturerId}
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
