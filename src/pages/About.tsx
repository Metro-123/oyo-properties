import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const VALUES = [
  { icon: '🏆', title: 'Excellence', desc: 'We hold ourselves to the highest standard in every listing, every agent interaction, and every transaction.' },
  { icon: '🤝', title: 'Trust', desc: 'Every listing is verified. Every agent is background-checked. Every transaction is transparent.' },
  { icon: '🌍', title: 'Community', desc: 'We are rooted in Ibadan and Oyo State. Our success is measured by the communities we help build.' },
  { icon: '⚡', title: 'Innovation', desc: 'We use technology to make property search faster, smarter, and more accessible for everyone.' },
]

const MILESTONES = [
  { year: '2020', title: 'Founded in Ibadan', desc: 'Started with 12 listings and a vision to bring transparency to Oyo State real estate.' },
  { year: '2021', title: '100+ Verified Listings', desc: 'Grew our verified property portfolio to over 100 listings across Ibadan.' },
  { year: '2022', title: 'Agent Network Launch', desc: 'Onboarded 50+ verified agents bringing professional standards to the market.' },
  { year: '2023', title: '500 Happy Customers', desc: 'Celebrated 500 successful property transactions with zero unresolved disputes.' },
  { year: '2024', title: 'Platform 2.0', desc: 'Launched advanced search, virtual tours, and instant inquiry features.' },
  { year: '2026', title: '1,000+ Customers & Growing', desc: 'Now the most trusted property platform in Oyo State with 500+ active listings.' },
]

export default function About() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.agents.list()
      .then(setAgents)
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #f0fdf4 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-8 left-10 w-44 h-44 rounded-full" style={{ background: '#16a34a' }} />
        </div>
        <div className="absolute hidden lg:block top-8 right-16 w-72 h-72 rounded-full overflow-hidden border-8 border-white/70 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=700&h=700&fit=crop&auto=format"
            alt="Comfortable modern home interior"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Ibadan's Most Trusted
            <span className="block" style={{ color: '#16a34a' }}>Property Platform</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            OyoProperties was founded with a simple mission: to make finding, buying, renting, and
            investing in property across Oyo State transparent, stress-free, and trustworthy.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="rounded-2xl overflow-hidden bg-gray-200 shadow-xl" style={{ height: '400px' }}>
            <img src="https://images.unsplash.com/photo-1783260606376-046b461ba2bc?w=800&h=500&fit=crop&auto=format" alt="Ibadan aerial view" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-black text-gray-900 mb-5">Building Trust in Oyo State Real Estate</h2>
            <p className="text-gray-400 leading-relaxed mb-5 text-sm">
              The real estate market in Ibadan and across Oyo State has historically been plagued by
              unverified listings, unreliable agents, and hidden fees. We set out to change that.
            </p>
            <p className="text-gray-400 leading-relaxed text-sm">
              Every property on our platform is physically inspected and legally verified before going
              live. Every agent is background-checked, licensed, and rated by real customers. We believe
              that finding your next home should be an exciting journey, not a stressful ordeal.
            </p>
            <div className="grid grid-cols-2 gap-5 mt-8">
              {[
                { value: '500+', label: 'Active Listings' },
                { value: '200+', label: 'Verified Agents' },
                { value: '1,000+', label: 'Happy Customers' },
                { value: '6', label: 'Years of Experience' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-black" style={{ color: '#16a34a' }}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-black text-gray-900 text-lg mb-3">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Our Journey</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">From Startup to Oyo State's #1 Platform</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />
          <div className="space-y-10">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-16 md:pl-0`}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 inline-block w-full md:max-w-xs">
                    <div className="text-xs font-black text-green-600 mb-1">{m.year}</div>
                    <div className="font-bold text-gray-900 text-sm mb-1">{m.title}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{m.desc}</div>
                  </div>
                </div>
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow" style={{ background: '#16a34a' }} />
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Agents */}
      <section id="agents" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Meet Our Verified Agents</h2>
            <p className="text-gray-400 mt-2">Every agent is background-checked, licensed, and rated by real customers.</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl animate-pulse" style={{ height: '240px' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white mx-auto mb-4" style={{ background: '#16a34a' }}>
                    {agent.avatar_initials}
                  </div>
                  <div className="font-black text-gray-900 mb-1">{agent.name}</div>
                  <div className="text-xs text-gray-400 mb-3">{agent.specialization}</div>
                  {agent.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full mb-3">
                      ✅ Verified
                    </span>
                  )}
                  <div className="text-xs text-gray-400">{agent.listings_count} active listings</div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a href={`tel:${agent.phone}`} className="block text-xs font-semibold hover:text-green-600 transition-colors" style={{ color: '#16a34a' }}>
                      {agent.phone}
                    </a>
                    <a href={`mailto:${agent.email}`} className="block text-xs text-gray-400 hover:text-green-600 transition-colors mt-1">{agent.email}</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5">Ready to Find Your Property?</h2>
          <p className="text-green-100 mb-8 text-sm leading-relaxed">Join over 1,000 happy customers who found their perfect home through OyoProperties.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/properties')} className="px-8 py-3.5 bg-white font-bold text-green-700 rounded-xl hover:bg-green-50 transition-colors text-sm">Browse Properties</button>
            <button onClick={() => navigate('/contact')} className="px-8 py-3.5 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  )
}
