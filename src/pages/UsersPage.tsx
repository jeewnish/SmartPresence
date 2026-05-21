import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileUp, RefreshCcw, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usersApi } from '../api/users'
import type { ApiUser } from '../api/users'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { Drawer } from '../components/common/Drawer'
import { PageHeader } from '../components/common/PageHeader'
import type { UserRole } from '../types/models'

const roleTabs: UserRole[] = ['Student', 'Lecturer', 'Admin']

export function UsersPage() {
  const [role, setRole] = useState<UserRole>('Student')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<'All' | 'Active' | 'Suspended'>('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [users, setUsers] = useState<ApiUser[]>([])

  useEffect(() => {
    let active = true

    const roleParam = role.toUpperCase()
    const statusParam = status === 'All' ? undefined : status === 'Active'

    usersApi
      .search({
        role: roleParam,
        search: search || undefined,
        isActive: statusParam,
        size: 200,
      })
      .then((res) => {
        if (!active) return
        setUsers(res.content)
        setSelectedIds([])
      })
      .catch((err) => console.error('Failed to load users', err))

    return () => {
      active = false
    }
  }, [role, search, status])

  const departments = useMemo(
    () => ['All', ...new Set(users.map((user) => user.department?.name ?? 'N/A'))],
    [users],
  )

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleName =
        user.role === 'STUDENT'
          ? 'Student'
          : user.role === 'LECTURER'
            ? 'Lecturer'
            : 'Admin'
      if (roleName !== role) return false
      if (
        search &&
        !`${user.firstName} ${user.lastName} ${user.email} ${user.indexNumber ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false
      }
      if (department !== 'All' && (user.department?.name ?? 'N/A') !== department) {
        return false
      }
      if (status !== 'All' && (user.isActive ? 'Active' : 'Suspended') !== status) {
        return false
      }
      return true
    })
  }, [users, role, search, department, status])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    )
  }

  const columns = useMemo<ColumnDef<ApiUser, unknown>[]>(
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
              setSelectedIds(
                event.target.checked
                  ? filteredUsers.map((user) => String(user.userId))
                  : [],
              )
            }
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(String(row.original.userId))}
            onChange={() => toggleSelection(String(row.original.userId))}
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
        cell: ({ row }) => row.original.indexNumber ?? '-',
      },
      {
        accessorKey: 'fullName',
        header: 'Full Name',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => row.original.department?.name ?? 'N/A',
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
          <Badge variant={row.original.isActive ? 'success' : 'warning'}>
            {row.original.isActive ? 'Active' : 'Suspended'}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : '-',
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
        title={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName} - Quick View`
            : 'Quick View'
        }
      >
        {selectedUser ? (
          <div className="space-y-4 text-sm">
            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Profile</p>
              <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                <p>ID: {selectedUser.indexNumber ?? '-'}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Department: {selectedUser.department?.name ?? 'N/A'}</p>
                <p>Status: {selectedUser.isActive ? 'Active' : 'Suspended'}</p>
              </div>
            </Card>

            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Account</p>
              <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                <p>Role: {selectedUser.role}</p>
                <p>Created: {new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-3">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Recent Attendance</p>
              <div className="mt-2 text-xs text-slate-500">
                Attendance details are available in the session logs.
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                Reset Device Binding
              </button>
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                {selectedUser.isActive ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
