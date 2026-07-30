import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import RooftopDivider from '../components/RooftopDivider'
import { api } from '../lib/api'
import { buildTeaser } from '../lib/teaser'

type User = { id: string; email: string } | null

const STATS = [
  { value: '500+', label: 'Active Listings' },
  { value: '200+', label: 'Verified Agents' },
  { value: '1,000+', label: 'Happy Customers' },
  { value: '100%', label: 'Verified Properties' },
]

const STEPS = [
  { icon: '🔍', step: '01', title: 'Search', desc: 'Browse our database of 500+ verified properties across Ibadan and Oyo State. Filter by location, type, and budget.' },
  { icon: '🤝', step: '02', title: 'Connect', desc: 'Reach out to verified agents, schedule property viewings, and get expert advice tailored to your needs.' },
  { icon: '🏠', step: '03', title: 'Move In', desc: 'Complete your transaction securely with our support team by your side every step of the way.' },
]

const TESTIMONIALS = [
  { name: 'Adebayo Olusanya', role: 'Homeowner, Jericho', avatar: 'AO', text: 'OyoProperties made finding my dream home so easy. The agents were professional and the process was seamless from search to closing.', rating: 5 },
  { name: 'Funke Adeyemi', role: 'Investor, Oluyole', avatar: 'FA', text: 'I have bought two investment properties through this platform. The listings are always accurate and the team is incredibly responsive.', rating: 5 },
  { name: 'Emeka Okafor', role: 'Tenant, Bodija', avatar: 'EO', text: 'Found a perfect apartment within my budget in just three days. Could not believe how straightforward the whole rental process was.', rating: 5 },
]

export default function Home({ user }: { user?: User } = {}) {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [propType, setPropType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const HOME_LISTINGS_LIMIT = 6

  useEffect(() => {
    // Published properties are publicly readable, so this loads for logged-out
    // visitors too — Home just decides below whether to render the real cards
    // or a randomized preview of them.
    api.properties.list()
      .then((all: any[]) => {
        // Show featured listings first, then fill remaining slots with the rest, capped at the limit
        const sorted = [...all].sort((a, b) => Number(b.featured) - Number(a.featured))
        setFeatured(sorted.slice(0, HOME_LISTINGS_LIMIT))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('search', location)
    if (propType) params.set('type', propType)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&h=1200&fit=crop&auto=format"
          alt="Home exterior at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgba(46,17,20,0.92) 0%, rgba(46,17,20,0.72) 40%, rgba(46,17,20,0.35) 75%, rgba(46,17,20,0.15) 100%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-7" style={{ borderColor: 'rgba(198,154,78,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-gold-500)' }} />
              <span className="eyebrow" style={{ color: 'var(--color-gold-300)', letterSpacing: '0.12em' }}>Trusted by 1,000+ homeowners across Oyo State</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.05] mb-7" style={{ fontWeight: 450 }}>
              Find your perfect
              <span className="block italic" style={{ color: 'var(--color-gold-500)', fontWeight: 500 }}>home in Ibadan</span>
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-xl leading-relaxed">
              Discover verified properties across Ibadan and Oyo State. Buy, rent, or invest with confidence through our network of trusted, verified agents.
            </p>

            <form onSubmit={handleSearch} className="bg-white shadow-2xl p-4 flex flex-col md:flex-row gap-3 rounded-sm">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink-500 mb-1 px-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bodija, Jericho, GRA..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm text-ink-900 bg-stone-50 px-3 py-2.5 outline-none focus:ring-2 border border-transparent rounded-sm"
                  style={{ ['--tw-ring-color' as any]: 'var(--color-gold-500)' }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink-500 mb-1 px-1">Property Type</label>
                <select value={propType} onChange={(e) => setPropType(e.target.value)} className="w-full text-sm text-ink-700 bg-stone-50 px-3 py-2.5 outline-none rounded-sm border border-transparent">
                  <option value="">Any Type</option>
                  <option>Apartment</option>
                  <option>Bungalow</option>
                  <option>Duplex</option>
                  <option>Terrace</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-ink-500 mb-1 px-1">Price Range (₦)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm text-ink-900 bg-stone-50 px-3 py-2.5 outline-none rounded-sm border border-transparent"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm text-ink-900 bg-stone-50 px-3 py-2.5 outline-none rounded-sm border border-transparent"
                  />
                </div>
              </div>
              <button type="submit" className="btn-gold md:self-end px-6 py-2.5 text-sm rounded-sm whitespace-nowrap active:scale-95 transition-transform">
                Search Properties
              </button>
            </form>

            <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/55">
              <span>🏘️ <strong className="text-white/85 font-semibold">500+</strong> Active Listings</span>
              <span>✅ <strong className="text-white/85 font-semibold">200+</strong> Verified Agents</span>
              <span>⚡ <strong className="text-white/85 font-semibold">Updated Daily</strong></span>
            </div>
          </div>
        </div>
        <RooftopDivider color="var(--color-stone-50)" background="transparent" />
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--color-gold-600)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl text-white">{s.value}</div>
              <div className="text-sm font-medium mt-1" style={{ color: 'var(--color-gold-100)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="eyebrow mb-2" style={{ color: 'var(--color-gold-600)' }}>Properties</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900">Featured listings</h2>
            <p className="text-ink-500 mt-2 max-w-md">Handpicked properties across Ibadan's most desirable neighbourhoods.</p>
          </div>
          <button onClick={() => navigate('/properties')} className="btn-outline-ink self-start md:self-auto px-5 py-2.5 text-sm rounded-sm">
            View All Properties →
          </button>
        </div>

        {!user && (
          <div className="border border-dashed px-6 py-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-sm" style={{ borderColor: 'var(--color-gold-500)', background: 'var(--color-gold-50)' }}>
            <p className="text-sm text-ink-700">
              <span className="mr-1">🔒</span>
              These are real listings — pricing, location and specs are hidden until you sign in.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/login" className="btn-gold px-5 py-2 text-sm rounded-sm">Sign In</Link>
              <Link to="/register" className="btn-outline-ink px-5 py-2 text-sm rounded-sm bg-white">Create Account</Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-stone-100 animate-pulse rounded-sm" style={{ height: '320px' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} p={user ? p : buildTeaser(p)} locked={!user} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20" style={{ background: 'var(--color-stone-100)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="eyebrow mb-2" style={{ color: 'var(--color-gold-600)' }}>Process</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900">How it works</h2>
            <p className="text-ink-500 mt-2 max-w-md mx-auto">From search to move-in, we handle everything so you can focus on what matters.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--color-stone-200)' }}>
            {STEPS.map((s) => (
              <div key={s.step} className="bg-white p-8">
                <div className="w-14 h-14 flex items-center justify-center text-2xl mb-5 rounded-sm" style={{ background: 'var(--color-gold-50)' }}>{s.icon}</div>
                <div className="eyebrow mb-2" style={{ color: 'var(--color-gold-600)' }}>Step {s.step}</div>
                <h3 className="font-display text-xl text-ink-900 mb-3">{s.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="overflow-hidden bg-stone-200 shadow-xl rounded-sm" style={{ height: '420px' }}>
              <img src="https://images.unsplash.com/photo-1639774275491-71d62502a4e0?w=800&h=600&fit=crop&auto=format" alt="Ibadan cityscape" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-5 shadow-xl rounded-sm" style={{ border: '1px solid var(--color-stone-200)' }}>
              <div className="font-display text-3xl text-ink-900">4.9★</div>
              <div className="text-xs text-ink-500 mt-1">Average rating</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-gold-600)' }}>from 1,000+ reviews</div>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--color-gold-600)' }}>Why Choose Us</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-5 leading-tight">
              Ibadan's most trusted
              <span className="block italic" style={{ color: 'var(--color-gold-600)' }}>property platform</span>
            </h2>
            <p className="text-ink-500 mb-8 leading-relaxed">We verify every listing and every agent so you can search, connect, and transact with total confidence — no surprises, no hidden fees.</p>
            <div className="space-y-5">
              {[
                { icon: '✅', title: 'All Listings Verified', desc: 'Every property is inspected and documented before it goes live.' },
                { icon: '🔒', title: 'Secure Transactions', desc: 'Escrow-backed payments and legal support at every step.' },
                { icon: '📞', title: 'Dedicated Support', desc: '24/7 customer support team ready to assist buyers, sellers, and tenants.' },
                { icon: '💰', title: 'No Hidden Agent Fees', desc: 'Transparent pricing with no surprise commissions or add-ons.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 text-lg rounded-sm" style={{ background: 'var(--color-gold-50)' }}>{f.icon}</div>
                  <div>
                    <div className="font-bold text-ink-900 text-sm">{f.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'var(--color-wine-950)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="eyebrow mb-2" style={{ color: 'var(--color-gold-500)' }}>Testimonials</p>
            <h2 className="font-display text-3xl md:text-4xl text-white">What our clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-7 rounded-sm" style={{ background: 'var(--color-wine-900)', border: '1px solid rgba(198,154,78,0.2)' }}>
                <div className="flex gap-1 mb-5">{Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-sm" style={{ color: 'var(--color-gold-500)' }}>★</span>)}</div>
                <p className="text-sm text-white/70 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--color-gold-500)', color: 'var(--color-wine-950)' }}>{t.avatar}</div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-white/45">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, var(--color-gold-700) 0%, var(--color-gold-600) 55%, var(--color-gold-500) 100%)' }}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-4" style={{ color: 'var(--color-gold-300)' }}>Ready to Move?</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-5 leading-tight">
            Find your dream home
            <span className="block italic" style={{ color: 'var(--color-gold-300)' }}>in Ibadan today</span>
          </h2>
          <p className="text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">From Bodija to GRA to Jericho — explore hundreds of verified properties with no hidden agent fees.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/properties')} className="px-8 py-3.5 bg-white font-bold rounded-sm hover:bg-stone-50 transition-colors text-sm" style={{ color: 'var(--color-gold-700)' }}>Browse Listings</button>
            <button onClick={() => navigate('/contact')} className="btn-ghost-dark px-8 py-3.5 rounded-sm text-sm">Talk to an Agent</button>
          </div>
          <p className="text-white/60 text-xs mt-6">500+ active listings · Updated daily · No agent fees</p>
        </div>
      </section>
    </div>
  )
}
