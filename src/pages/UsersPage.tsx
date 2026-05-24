import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileUp, Plus, RefreshCcw, ShieldAlert, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usersApi } from '../api/users'
import type { ApiUser } from '../api/users'
import { Badge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { DataTable } from '../components/common/DataTable'
import { Drawer } from '../components/common/Drawer'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import { SegmentedTabs } from '../components/common/SegmentedTabs'
import { StatusMessage } from '../components/common/StatusMessage'
import type { UserRole } from '../types/models'

const roleTabs: UserRole[] = ['Student', 'Lecturer', 'Admin']
const roleLabels: Record<UserRole, string> = {
  Student: 'Student',
  Lecturer: 'Lecturer',
  Admin: 'Admin',
}

const roleApiValues: Record<UserRole, ApiUser['role']> = {
  Student: 'STUDENT',
  Lecturer: 'LECTURER',
  Admin: 'ADMIN',
}

export function UsersPage() {
  const [role, setRole] = useState<UserRole>('Student')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<'All' | 'Active' | 'Suspended'>('All')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Pass@1234',
    indexNumber: '',
    enrollmentYear: String(new Date().getFullYear()),
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadUsers = async () => {
    const roleParam = role.toUpperCase()
    const statusParam = status === 'All' ? undefined : status === 'Active'
    const res = await usersApi.search({
      role: roleParam,
      search: search || undefined,
      isActive: statusParam,
      size: 200,
    })
    setUsers(res.content)
    setSelectedIds([])
  }

  useEffect(() => {
    let active = true

    loadUsers()
      .then(() => {
        if (!active) return
        setMessage(null)
      })
      .catch((err) => console.error('Failed to load users', err))

    return () => {
      active = false
    }
  }, [role, search, status])

  const handleBulkStatus = async (active: boolean) => {
    if (selectedIds.length === 0) return

    try {
      await Promise.all(
        selectedIds.map((id) => usersApi.setStatus(Number(id), active)),
      )
      await loadUsers()
      setMessage(active ? 'Selected accounts activated.' : 'Selected accounts suspended.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update selected accounts.')
    }
  }

  const resetNewUserForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: 'Pass@1234',
      indexNumber: '',
      enrollmentYear: String(new Date().getFullYear()),
    })
  }

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await usersApi.register({
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: roleApiValues[role],
        indexNumber: role === 'Student' ? newUser.indexNumber.trim() || undefined : undefined,
        enrollmentYear:
          role === 'Student' && newUser.enrollmentYear
            ? Number(newUser.enrollmentYear)
            : undefined,
      })
      await loadUsers()
      setAddModalOpen(false)
      resetNewUserForm()
      setMessage(`${roleLabels[role]} added successfully.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to add ${roleLabels[role].toLowerCase()}.`)
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return

    try {
      await Promise.all(selectedIds.map((id) => usersApi.setStatus(Number(id), false)))
      await loadUsers()
      setRemoveModalOpen(false)
      setMessage(
        selectedIds.length === 1
          ? `${roleLabels[role]} removed.`
          : `${selectedIds.length} ${roleLabels[role].toLowerCase()}s removed.`,
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to remove ${roleLabels[role].toLowerCase()}s.`)
    }
  }

  const handleCsvImport = async (file: File) => {
    const text = await file.text()
    const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean)
    const headers = headerLine.split(',').map((value) => value.trim())
    const records = lines.map((line) => {
      const values = line.split(',').map((value) => value.trim())
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    })

    try {
      await Promise.all(
        records.map((record) =>
          usersApi.register({
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email,
            password: record.password || 'TempPass123!',
            role: (record.role?.toUpperCase() || role.toUpperCase()) as ApiUser['role'],
            indexNumber: record.indexNumber || undefined,
            enrollmentYear: record.enrollmentYear ? Number(record.enrollmentYear) : undefined,
          }),
        ),
      )
      await loadUsers()
      setMessage(`${records.length} users imported.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to import users.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleCsvImport(file)
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              <FileUp className="h-3.5 w-3.5" /> Import Users (CSV)
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add {roleLabels[role]}
            </button>
            <button
              onClick={() => setRemoveModalOpen(true)}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:bg-slate-900 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove {roleLabels[role]}
            </button>
          </>
        }
      />
      <StatusMessage message={message} />

      <Card>
        <SegmentedTabs
          items={roleTabs}
          value={role}
          onChange={(nextRole) => {
            setRole(nextRole)
            setSelectedIds([])
          }}
          getLabel={(tab) => `${tab}s`}
          className="mb-4 items-center"
        />

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
            onClick={() => handleBulkStatus(false)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Suspend Selected
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={() => handleBulkStatus(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Activate Selected
          </button>
        </div>

        <DataTable data={filteredUsers} columns={columns} emptyLabel="No users match these filters" />
      </Card>

      <Modal
        open={addModalOpen}
        title={`Add ${roleLabels[role]}`}
        onClose={() => setAddModalOpen(false)}
        widthClassName="max-w-xl"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">First Name</span>
              <input
                required
                value={newUser.firstName}
                onChange={(event) => setNewUser((prev) => ({ ...prev, firstName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Last Name</span>
              <input
                required
                value={newUser.lastName}
                onChange={(event) => setNewUser((prev) => ({ ...prev, lastName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <input
                required
                type="email"
                value={newUser.email}
                onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Temporary Password</span>
              <input
                required
                type="text"
                minLength={8}
                value={newUser.password}
                onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            {role === 'Student' ? (
              <>
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Index Number</span>
                  <input
                    value={newUser.indexNumber}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, indexNumber: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-slate-700 dark:text-slate-200">Enrollment Year</span>
                  <input
                    type="number"
                    value={newUser.enrollmentYear}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, enrollmentYear: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add {roleLabels[role]}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={removeModalOpen}
        title={`Remove ${roleLabels[role]}${selectedIds.length === 1 ? '' : 's'}`}
        onClose={() => setRemoveModalOpen(false)}
        widthClassName="max-w-lg"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            This will suspend the selected {roleLabels[role].toLowerCase()}
            {selectedIds.length === 1 ? '' : 's'} in the backend.
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto">
            {filteredUsers
              .filter((user) => selectedIds.includes(String(user.userId)))
              .map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setRemoveModalOpen(false)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRemoveSelected}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Selected
            </button>
          </div>
        </div>
      </Modal>

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
              <button
                disabled
                title="The backend does not expose a reset-device-binding endpoint yet."
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold opacity-50 dark:border-slate-700"
              >
                Reset Device Binding
              </button>
              <button
                onClick={async () => {
                  await usersApi.setStatus(selectedUser.userId, !selectedUser.isActive)
                  await loadUsers()
                  setSelectedUser(null)
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
              >
                {selectedUser.isActive ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
