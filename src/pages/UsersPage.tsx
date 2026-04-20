import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileUp, RefreshCcw, ShieldAlert, UserCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { Drawer } from '../components/common/Drawer'
import { PageHeader } from '../components/common/PageHeader'
import { users } from '../data/mockData'
import type { UserAccount, UserRole } from '../types/models'

const roleTabs: UserRole[] = ['Student', 'Lecturer', 'Admin']

export function UsersPage() {
  const [role, setRole] = useState<UserRole>('Student')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<'All' | 'Active' | 'Suspended'>('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)

  const departments = useMemo(
    () => ['All', ...new Set(users.map((user) => user.department))],
    [],
  )

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (user.role !== role) return false
      if (
        search &&
        !`${user.fullName} ${user.email} ${user.indexNo}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false
      }
      if (department !== 'All' && user.department !== department) return false
      if (status !== 'All' && user.status !== status) return false
      return true
    })
  }, [role, search, department, status])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    )
  }

  const columns = useMemo<ColumnDef<UserAccount, unknown>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={
              filteredUsers.length > 0 && selectedIds.length === filteredUsers.length
            }
            onChange={(event) =>
              setSelectedIds(event.target.checked ? filteredUsers.map((user) => user.id) : [])
            }
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={() => toggleSelection(row.original.id)}
          />
        ),
      },
      {
        accessorFn: (_row, index) => index + 1,
        id: 'index',
        header: '#',
        cell: (info) => info.getValue<number>(),
      },
      {
        accessorKey: 'indexNo',
        header: 'Index / ID',
      },
      {
        accessorKey: 'fullName',
        header: 'Full Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'department',
        header: 'Department',
      },
      {
        accessorKey: 'enrollmentYear',
        header: 'Enrollment Year',
        cell: ({ row }) => row.original.enrollmentYear ?? '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'Active' ? 'success' : 'warning'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedUser(row.original)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </button>
        ),
      },
    ],
    [filteredUsers, selectedIds],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users Directory"
        subtitle="Manage students, lecturers, and administrators with profile and security controls."
        actions={
          <button className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700">
            <FileUp className="h-3.5 w-3.5" /> Import Users (CSV)
          </button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {roleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setRole(tab)
                setSelectedIds([])
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                role === tab
                  ? 'bg-sky-600 text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, ID"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-sky-500/40 focus:ring dark:border-slate-700 dark:bg-slate-900"
          />

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                Department: {dep}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'All' | 'Active' | 'Suspended')
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Suspended">Status: Suspended</option>
          </select>

          <div className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {selectedIds.length} selected for bulk actions
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Suspend Selected
          </button>
          <button
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Activate Selected
          </button>
        </div>

        <DataTable data={filteredUsers} columns={columns} emptyLabel="No users match these filters" />
      </Card>

      <Drawer
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser.fullName} - Quick View` : 'Quick View'}
      >
        {selectedUser ? (
          <div className="space-y-4 text-sm">
            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Profile</p>
              <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                <p>ID: {selectedUser.indexNo}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Department: {selectedUser.department}</p>
                <p>Status: {selectedUser.status}</p>
              </div>
            </Card>

            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Device Binding Status</p>
              <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                <p>Fingerprint: {selectedUser.deviceFingerprint}</p>
                <p>Model: {selectedUser.deviceModel}</p>
                <p>OS: {selectedUser.deviceOS}</p>
              </div>
            </Card>

            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Biometric Status</p>
              <div className="mt-2 space-y-1">
                <Badge variant={selectedUser.faceIdEnrolled ? 'success' : 'warning'}>
                  FaceID {selectedUser.faceIdEnrolled ? 'Enrolled' : 'Not enrolled'}
                </Badge>
                <Badge
                  variant={selectedUser.fingerprintEnrolled ? 'success' : 'warning'}
                  className="ml-2"
                >
                  Fingerprint {selectedUser.fingerprintEnrolled ? 'Enrolled' : 'Not enrolled'}
                </Badge>
              </div>
            </Card>

            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Recent Attendance</p>
              <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-2 py-1 text-left">Course</th>
                      <th className="px-2 py-1 text-left">Date</th>
                      <th className="px-2 py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.recentAttendance.map((item) => (
                      <tr key={`${item.course}-${item.date}`}>
                        <td className="px-2 py-1">{item.course}</td>
                        <td className="px-2 py-1">{item.date}</td>
                        <td className="px-2 py-1">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                <UserCog className="h-3.5 w-3.5" /> Edit Profile
              </button>
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                Reset Device Binding
              </button>
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                {selectedUser.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
