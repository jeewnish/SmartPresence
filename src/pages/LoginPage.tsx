import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import loginBg from '../assets/db-bg-login.jpg'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#151635]/95 via-[#1a1c3f]/95 to-[#0f1026]/95" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-4xl rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_120px_rgba(5,6,30,0.6)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-10 top-12 h-20 w-20 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-10 top-10 h-2 w-2 rounded-full bg-white/50" />
          <div className="pointer-events-none absolute left-16 top-8 text-white/40">+</div>
          <div className="pointer-events-none absolute right-16 top-24 text-white/30">+</div>

          <div className="flex flex-col items-center">
            <p className="font-heading text-3xl font-semibold tracking-wide">SmartPresence</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">
              Admin Console
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#22233f]/80 p-6 shadow-[0_20px_60px_rgba(6,8,30,0.55)]">
              <div className="pointer-events-none absolute -top-6 left-10 h-12 w-24 rounded-full bg-white/10" />
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="admin@university.edu"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none ring-white/10 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-white/10 focus:ring-2"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c1d3f] transition hover:bg-white/90 disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Log in'}
                </button>
              </form>

              <button className="mt-4 w-full text-center text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white">
                Forgot your password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
