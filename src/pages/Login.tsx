import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    navigate(next)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${next}` },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email address first, then select Forgot password.')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) setError(err.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #14532d 0%, #16a34a 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full bg-white" />
        </div>

        <Link to="/" className="relative">
          <Logo size="md" white />
        </Link>

        <div className="relative">
          <div className="text-4xl font-black text-white leading-snug mb-5">
            Welcome back to<br />Oyo State's #1<br />Property Platform
          </div>
          <p className="text-green-100 text-sm leading-relaxed mb-8">
            Sign in to access saved properties, track your inquiries, and connect with verified agents across Ibadan.
          </p>
          <div className="space-y-3">
            {[
              '500+ verified listings across Ibadan',
              'Connect with 200+ vetted agents',
              'Secure, transparent transactions',
              'No hidden fees, ever',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-green-100">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-green-300 text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="bg-white/10 border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-300 flex items-center justify-center text-xs font-bold text-green-900">FA</div>
              <div>
                <div className="text-sm font-bold text-white">Funke Adeyemi</div>
                <div className="text-xs text-green-300">Investor, Oluyole Estate</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xs">★</span>)}
              </div>
            </div>
            <p className="text-xs text-green-100 italic leading-relaxed">
              "I've closed two investment properties through OyoProperties. Always accurate listings, always responsive agents."
            </p>
          </div>
          <p className="text-xs text-green-400">© 2026 OyoProperties. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/"><Logo size="md" /></Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Sign In</h2>
            <p className="text-sm text-gray-400 mb-7">Enter your credentials to access your account</p>

            {next !== '/' && !error && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-xs px-4 py-3 rounded-xl mb-5">
                Please sign in to view property listings.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}
            {resetSent && <div className="bg-green-50 border border-green-100 text-green-700 text-xs px-4 py-3 rounded-xl mb-5">Password reset email sent. Open it and follow the link to choose a new password.</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500">Password</label>
                  <button type="button" onClick={handlePasswordReset} disabled={loading} className="text-xs hover:underline disabled:opacity-60" style={{ color: '#16a34a' }}>Forgot password?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#16a34a' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 text-sm font-bold text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-60">
              <span className="text-lg">G</span>
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#16a34a' }}>
                Create one free →
              </Link>
            </p>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 mb-3">Sign up as</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/register"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all text-center"
                >
                  <span className="text-xl">🔍</span>
                  <span className="text-xs font-semibold text-gray-700">Property Seeker</span>
                </Link>
                <Link
                  to="/register"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all text-center"
                >
                  <span className="text-xl">🏠</span>
                  <span className="text-xs font-semibold text-gray-700">Landlord / Agent</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
