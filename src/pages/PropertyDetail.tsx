import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [inquiryType, setInquiryType] = useState('Request a viewing')
  const [viewingDate, setViewingDate] = useState('')
  const [depositPercent, setDepositPercent] = useState(20)
  const [loanYears, setLoanYears] = useState(15)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return
    api.properties.get(id)
      .then((data) => { setProperty(data); setActiveImage(0) })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.inquiries.create({
        ...form,
        property_id: id!,
        property_title: property.title,
        inquiry_type: inquiryType,
        message: viewingDate ? `${form.message}\n\nPreferred viewing date: ${viewingDate}` : form.message,
      })
      setSent(true)
    } catch {
      setError('Failed to send inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading property...</p>
      </div>
    </div>
  )

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🏚️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Property not found</h2>
        <button onClick={() => navigate('/properties')} className="mt-4 px-6 py-2.5 text-sm font-bold text-white rounded-xl" style={{ background: 'var(--color-gold-600)' }}>Back to Listings</button>
      </div>
    </div>
  )

  const photos: string[] = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop&auto=format']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-green-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/properties')} className="hover:text-green-600 transition-colors">Properties</button>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Photo gallery */}
            <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-sm" style={{ height: '420px' }}>
              <img
                src={photos[activeImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            {photos.length > 1 && <div className="flex gap-2 overflow-x-auto py-3 mb-3">{photos.map((photo, index) => <button key={photo} type="button" onClick={() => setActiveImage(index)} className={`shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === index ? 'border-green-600' : 'border-transparent'}`}><img src={photo} alt={`${property.title} photo ${index + 1}`} className="w-20 h-16 object-cover" /></button>)}</div>}

            {/* Title & Price */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: property.listing_type === 'rent' ? 'var(--color-wine-800)' : 'var(--color-gold-600)' }}>
                      {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">{property.type}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900">{property.title}</h1>
                  <p className="text-gray-400 mt-1 flex items-center gap-1"><span>📍</span> {property.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black" style={{ color: 'var(--color-gold-600)' }}>{property.price_display}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-t border-gray-100">
                {property.beds > 0 && <div className="text-center"><div className="text-lg font-black text-gray-800">🛏 {property.beds}</div><div className="text-xs text-gray-400 mt-0.5">Bedrooms</div></div>}
                <div className="text-center"><div className="text-lg font-black text-gray-800">🚿 {property.baths}</div><div className="text-xs text-gray-400 mt-0.5">Bathrooms</div></div>
                <div className="text-center"><div className="text-lg font-black text-gray-800">📐 {property.sqft}</div><div className="text-xs text-gray-400 mt-0.5">Area</div></div>
              </div>
              {property.availability_text && <p className="mt-1 text-sm font-semibold text-green-700">✓ {property.availability_text}</p>}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-black text-gray-900 mb-4">Property Description</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
            </div>

            {property.amenities?.length > 0 && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"><h2 className="text-lg font-black text-gray-900 mb-4">Amenities</h2><div className="flex flex-wrap gap-2">{property.amenities.map((amenity: string) => <span key={amenity} className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">✓ {amenity}</span>)}</div></div>}

            {/* Agent */}
            {property.agents && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4">Listed By</h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: 'var(--color-gold-600)' }}>
                    {property.agents.avatar_initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{property.agents.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{property.agents.specialization}</div>
                    {property.agents.verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
                        ✅ Verified Agent
                      </span>
                    )}
                  </div>
                  <div className="ml-auto text-right">
                    <a href={`tel:${property.agents.phone}`} className="block text-sm font-semibold text-gray-700 hover:text-green-600">{property.agents.phone}</a>
                    <a href={`mailto:${property.agents.email}`} className="block text-xs text-gray-400 hover:text-green-600 mt-0.5">{property.agents.email}</a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inquiry Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-black text-gray-900 mb-1">Interested in this property?</h2>
              <p className="text-xs text-gray-400 mb-5">Send an inquiry to the agent and we'll get back to you within 24 hours.</p>

              {sent ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="font-bold text-gray-800 mb-1">Inquiry Sent!</h3>
                  <p className="text-sm text-gray-400">The agent will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-4">
                  {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">How can we help? *</label>
                    <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400"><option>Request a viewing</option><option>Ask a question</option><option>Make an offer</option><option>Request a call back</option></select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Message *</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder={`I'm interested in this ${property.title} and would like to schedule a viewing.`} className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Preferred viewing date</label>
                    <input type="date" value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2.5 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60" style={{ background: 'var(--color-gold-600)' }}>
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Or call directly</p>
                {property.agents && (
                  <a href={`tel:${property.agents.phone}`} className="block mt-2 text-sm font-bold hover:text-green-600 transition-colors" style={{ color: 'var(--color-gold-600)' }}>
                    📞 {property.agents.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
              <h2 className="text-base font-black text-gray-900 mb-1">Mortgage Estimator</h2>
              <p className="text-xs text-gray-400 mb-4">Estimate your monthly payment before arranging a viewing.</p>
              <div className="space-y-3">
                <label className="block text-xs text-gray-500">Deposit: {depositPercent}%<input type="range" min="10" max="80" value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value))} className="w-full accent-green-600 mt-1" /></label>
                <label className="block text-xs text-gray-500">Repayment period: {loanYears} years<input type="range" min="5" max="30" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} className="w-full accent-green-600 mt-1" /></label>
                <div className="rounded-xl bg-green-50 p-3"><div className="text-xs text-green-700">Estimated monthly payment*</div><div className="text-xl font-black text-green-700">₦{new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(((Number(property.price) * (1 - depositPercent / 100)) * (0.18 / 12) * Math.pow(1 + 0.18 / 12, loanYears * 12)) / (Math.pow(1 + 0.18 / 12, loanYears * 12) - 1))}</div></div>
                <p className="text-[10px] text-gray-400 leading-relaxed">*Illustration only, assuming 18% yearly interest. Confirm rates and eligibility with a lender.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
