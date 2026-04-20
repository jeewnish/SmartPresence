import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[70svh] place-items-center">
      <div className="text-center">
        <p className="text-5xl font-bold text-sky-500">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Route not found</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The requested admin route does not exist.
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-4 inline-flex rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
