import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [validLink, setValidLink] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase's email link either lands with a `#access_token=...&type=recovery` hash
    // (which the client parses automatically and fires PASSWORD_RECOVERY), or with an
    // `?code=...` query param that needs to be exchanged for a session (PKCE flow).
    const finish = (ok: boolean) => { setValidLink(ok); setReady(true) }

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') finish(true)
    })

    const init = async () => {
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code)
        finish(!err)
        return
      }
      // If the hash already had a recovery token, a session will exist by now.
      const { data } = await supabase.auth.getSession()
      if (data.session) finish(true)
      else setTimeout(async () => {
        const retry = await supabase.auth.getSession()
        finish(Boolean(retry.data.session))
      }, 800)
    }
    init()

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/"><Logo size="md" /></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {!ready && (
            <p className="text-center text-sm text-gray-500">Checking your reset link...</p>
          )}

          {ready && !validLink && !done && (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Link expired</h2>
              <p className="text-sm text-gray-500 mb-6">This password reset link is invalid or has expired. Request a new one from the sign-in page.</p>
              <Link to="/login" className="inline-block w-full text-center py-3.5 text-sm font-bold text-white rounded-xl" style={{ background: '#16a34a' }}>Back to sign in</Link>
            </>
          )}

          {ready && validLink && !done && (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Set a new password</h2>
              <p className="text-sm text-gray-400 mb-7">Choose a new password for your account.</p>

              {error && <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-xl mb-5">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                  {loading ? 'Saving...' : 'Save new password'}
                </button>
              </form>
            </>
          )}

          {done && (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Password updated</h2>
              <p className="text-sm text-gray-500">You can now sign in with your new password. Redirecting you to sign in...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
