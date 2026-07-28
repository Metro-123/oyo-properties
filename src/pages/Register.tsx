import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import Logo from '../components/Logo'

type Role = 'seeker' | 'landlord'

const ROLES: { id: Role; icon: string; title: string; subtitle: string; perks: string[] }[] = [
  {
    id: 'seeker',
    icon: '🔍',
    title: 'Property Seeker',
    subtitle: 'I want to buy or rent a property',
    perks: ['Browse 500+ verified listings', 'Save favourite properties', 'Contact agents directly', 'Get price alerts'],
  },
  {
    id: 'landlord',
    icon: '🏠',
    title: 'Landlord / Agent',
    subtitle: 'I want to list and sell properties',
    perks: ['List unlimited properties', 'Manage tenant inquiries', 'Verified badge on listings', 'Analytics dashboard'],
  },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role>('seeker')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(true)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role } },
    })

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    if (data.user) {
      await api.profiles.create({
        id: data.user.id,
        full_name: form.name,
        phone: form.phone,
        role,
        company_name: form.company,
      }).catch(() => {})
    }

    // Some Supabase projects auto-activate a session on sign-up (when email confirmation is off).
    // Sign back out so the account never appears "logged in" until the person actually signs in.
    if (data.session) {
      await supabase.auth.signOut()
      setNeedsEmailConfirm(false)
    }

    setSuccess(true)
    setLoading(false)
  }

  const selectedRole = ROLES.find(r => r.id === role)!

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
          <h2 className="text-3xl font-black text-white leading-snug mb-4">
            Join Oyo State's most trusted property platform
          </h2>
          <p className="text-green-100 text-sm leading-relaxed mb-8">
            Whether you're looking for your next home or listing a property, OyoProperties connects
            buyers, renters, landlords, and agents across Ibadan.
          </p>

          <div className="space-y-4">
            {ROLES.map(r => (
              <div
                key={r.id}
                className="rounded-xl p-4 border transition-all"
                style={{
                  background: role === r.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  borderColor: role === r.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-bold text-white text-sm">{r.title}</span>
                  {role === r.id && <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Selected</span>}
                </div>
                <ul className="space-y-1">
                  {r.perks.map(p => (
                    <li key={p} className="text-xs text-green-100 flex items-center gap-2">
                      <span className="text-green-300">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 border border-white/10">
            <div className="w-9 h-9 rounded-full bg-green-300 flex items-center justify-center text-xs font-bold text-green-900">AO</div>
            <div>
              <div className="text-xs font-bold text-white">Adebayo Olusanya</div>
              <div className="text-xs text-green-200 italic mt-0.5">"Found my dream home in 3 days. Incredible platform."</div>
            </div>
          </div>
          <p className="text-xs text-green-400 mt-4">© 2026 OyoProperties. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center flex justify-center">
            <Link to="/"><Logo size="md" /></Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {success ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: '#f0fdf4' }}>🎉</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">You're all set!</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-2">
                  Welcome to OyoProperties as a <strong className="text-green-600">{selectedRole.title}</strong>.
                </p>
                <p className="text-sm text-gray-400 mb-7">
                  {needsEmailConfirm ? "Check your email to confirm your account, then sign in." : "Your account is ready. Sign in below to get started."}
                </p>
                <Link
                  to="/login"
                  className="block w-full py-3.5 text-sm font-bold text-white rounded-xl text-center transition-all hover:opacity-90"
                  style={{ background: '#16a34a' }}
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex border-b border-gray-100">
                  {[1, 2].map(s => (
                    <div
                      key={s}
                      className="flex-1 py-3 text-center text-xs font-bold transition-colors"
                      style={{
                        color: step >= s ? '#16a34a' : '#9ca3af',
                        borderBottom: step === s ? '2px solid #16a34a' : '2px solid transparent',
                      }}
                    >
                      {s === 1 ? '1. Choose Role' : '2. Your Details'}
                    </div>
                  ))}
                </div>

                <div className="p-8">
                  {step === 1 ? (
                    <>
                      <h2 className="text-xl font-black text-gray-900 mb-1">I am a...</h2>
                      <p className="text-sm text-gray-400 mb-6">Choose how you want to use OyoProperties</p>

                      <div className="space-y-3 mb-8">
                        {ROLES.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className="w-full text-left rounded-2xl border-2 p-5 transition-all"
                            style={{
                              borderColor: role === r.id ? '#16a34a' : '#e5e7eb',
                              background: role === r.id ? '#f0fdf4' : 'white',
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ background: role === r.id ? '#dcfce7' : '#f9fafb' }}
                              >
                                {r.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900">{r.title}</span>
                                  <div
                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                                    style={{ borderColor: role === r.id ? '#16a34a' : '#d1d5db' }}
                                  >
                                    {role === r.id && (
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#16a34a' }} />
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{r.subtitle}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                                  {r.perks.map(p => (
                                    <span key={p} className="text-xs text-gray-500 flex items-center gap-1">
                                      <span style={{ color: '#16a34a' }}>✓</span> {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setStep(2)}
                        className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
                        style={{ background: '#16a34a' }}
                      >
                        Continue as {selectedRole.title} →
                      </button>

                      <p className="text-center text-sm text-gray-400 mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: '#16a34a' }}>Sign in</Link>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors text-lg">←</button>
                        <div>
                          <h2 className="text-xl font-black text-gray-900 leading-none">Create your account</h2>
                          <p className="text-xs text-gray-400 mt-1">
                            Signing up as <span className="font-semibold" style={{ color: '#16a34a' }}>{selectedRole.title}</span>
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-xl mb-5">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                            <input
                              type="text"
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                              placeholder="Adebayo Olusanya"
                              className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={e => setForm({ ...form, phone: e.target.value })}
                              placeholder="+234 800 000 0000"
                              className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                          </div>
                          {role === 'landlord' && (
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company / Agency Name</label>
                              <input
                                type="text"
                                value={form.company}
                                onChange={e => setForm({ ...form, company: e.target.value })}
                                placeholder="e.g. Bakare Properties"
                                className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                              />
                            </div>
                          )}
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address *</label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              placeholder="you@example.com"
                              className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password *</label>
                            <input
                              type="password"
                              value={form.password}
                              onChange={e => setForm({ ...form, password: e.target.value })}
                              placeholder="Min. 6 characters"
                              className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm Password *</label>
                            <input
                              type="password"
                              value={form.confirm}
                              onChange={e => setForm({ ...form, confirm: e.target.value })}
                              placeholder="Repeat password"
                              className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-gray-400">
                          By creating an account you agree to our{' '}
                          <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and{' '}
                          <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>.
                        </p>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ background: '#16a34a' }}
                        >
                          {loading ? 'Creating Account...' : `Create ${selectedRole.title} Account`}
                        </button>
                      </form>

                      <p className="text-center text-sm text-gray-400 mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: '#16a34a' }}>Sign in</Link>
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
