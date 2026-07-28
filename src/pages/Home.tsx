import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full" style={{ background: '#15803d' }} />
        </div>
        <div className="absolute hidden lg:block top-14 right-16 w-72 h-72 rounded-full overflow-hidden border-8 border-white/70 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&h=700&fit=crop&auto=format"
            alt="Modern home exterior"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white border border-green-100 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">Trusted by 1,000+ homeowners across Oyo State</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Find Your Perfect
              <span className="block" style={{ color: '#16a34a' }}>Home in Ibadan</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
              Discover verified properties across Ibadan and Oyo State. Buy, rent, or invest with confidence through our network of trusted, verified agents.
            </p>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-3 border border-gray-100">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 mb-1 px-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bodija, Jericho, GRA..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-transparent focus:border-green-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 mb-1 px-1">Property Type</label>
                <select value={propType} onChange={(e) => setPropType(e.target.value)} className="w-full text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-transparent focus:border-green-400">
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
                <label className="block text-xs font-semibold text-gray-400 mb-1 px-1">Price Range (₦)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-transparent focus:border-green-400"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-300 border border-transparent focus:border-green-400"
                  />
                </div>
              </div>
              <button type="submit" className="md:self-end px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 active:scale-95 whitespace-nowrap" style={{ background: '#16a34a' }}>
                Search Properties
              </button>
            </form>

            <div className="flex flex-wrap gap-6 mt-8 text-sm text-gray-500">
              <span>🏘️ <strong className="text-gray-700">500+</strong> Active Listings</span>
              <span>✅ <strong className="text-gray-700">200+</strong> Verified Agents</span>
              <span>⚡ <strong className="text-gray-700">Updated Daily</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#16a34a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white">{s.value}</div>
              <div className="text-sm font-medium text-green-200 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Properties</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Featured Listings</h2>
            <p className="text-gray-400 mt-2 max-w-md">Handpicked properties across Ibadan's most desirable neighbourhoods.</p>
          </div>
          <button onClick={() => navigate('/properties')} className="self-start md:self-auto px-5 py-2.5 text-sm font-semibold border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
            View All Properties →
          </button>
        </div>

        {!user && (
          <div className="rounded-2xl border border-dashed border-green-200 bg-green-50 px-6 py-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm text-gray-600">
              <span className="mr-1">🔒</span>
              These are real listings — pricing, location and specs are hidden until you sign in.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/login" className="px-5 py-2 text-sm font-bold text-white rounded-xl" style={{ background: '#16a34a' }}>Sign In</Link>
              <Link to="/register" className="px-5 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl bg-white">Create Account</Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse" style={{ height: '320px' }} />
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">How It Works</h2>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">From search to move-in, we handle everything so you can focus on what matters.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: '#f0fdf4' }}>{s.icon}</div>
                <div className="text-xs font-black text-green-300 mb-2">STEP {s.step}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-gray-200 shadow-xl" style={{ height: '420px' }}>
              <img src="https://images.unsplash.com/photo-1639774275491-71d62502a4e0?w=800&h=600&fit=crop&auto=format" alt="Ibadan cityscape" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
              <div className="text-3xl font-black text-gray-900">4.9★</div>
              <div className="text-xs text-gray-400 mt-1">Average rating</div>
              <div className="text-xs font-semibold text-green-600 mt-0.5">from 1,000+ reviews</div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 leading-tight">
              Ibadan's Most Trusted
              <span className="block" style={{ color: '#16a34a' }}>Property Platform</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">We verify every listing and every agent so you can search, connect, and transact with total confidence — no surprises, no hidden fees.</p>
            <div className="space-y-5">
              {[
                { icon: '✅', title: 'All Listings Verified', desc: 'Every property is inspected and documented before it goes live.' },
                { icon: '🔒', title: 'Secure Transactions', desc: 'Escrow-backed payments and legal support at every step.' },
                { icon: '📞', title: 'Dedicated Support', desc: '24/7 customer support team ready to assist buyers, sellers, and tenants.' },
                { icon: '💰', title: 'No Hidden Agent Fees', desc: 'Transparent pricing with no surprise commissions or add-ons.' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: '#f0fdf4' }}>{f.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{f.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-5">{Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#16a34a' }}>{t.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-4">Ready to Move?</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Find Your Dream Home
            <span className="block text-green-300">in Ibadan Today</span>
          </h2>
          <p className="text-green-100 mb-10 max-w-xl mx-auto leading-relaxed">From Bodija to GRA to Jericho — explore hundreds of verified properties with no hidden agent fees.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/properties')} className="px-8 py-3.5 bg-white font-bold text-green-700 rounded-xl hover:bg-green-50 transition-colors text-sm">Browse Listings</button>
            <button onClick={() => navigate('/contact')} className="px-8 py-3.5 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm">Talk to an Agent</button>
          </div>
          <p className="text-green-300 text-xs mt-6">500+ active listings · Updated daily · No agent fees</p>
        </div>
      </section>
    </div>
  )
}