import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type User = { id: string; email: string } | null

const CONTACT_INFO = [
  { icon: '📍', label: 'Address', value: 'Bodija Estate, Ibadan, Oyo State, Nigeria' },
  { icon: '📞', label: 'Phone', value: '+234 801 234 5678', href: 'tel:+2348012345678' },
  { icon: '✉️', label: 'Email', value: 'info@oyoproperties.ng', href: 'mailto:info@oyoproperties.ng' },
  { icon: '🕐', label: 'Working Hours', value: 'Mon – Sat: 8am – 6pm WAT' },
]

const SUBJECTS = [
  'General Enquiry',
  'Buy a Property',
  'Rent a Property',
  'List My Property',
  'Investment Advice',
  'Agent Application',
  'Other',
]

export default function Contact({ user }: { user?: User } = {}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.contact.send(form)
      setSent(true)
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : ''
      setError(detail ? `Message could not be saved: ${detail}` : 'Message could not be saved. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--color-gold-50) 0%, var(--color-gold-100) 60%, var(--color-gold-50) 100%)' }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5">Contact Us</h1>
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
            Have a question about a property? Want to list your home? Our team is here to help — reach out and we'll respond within 24 hours.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-5 mb-8">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-gold-50)' }}>{c.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="text-sm text-gray-700 hover:text-green-600 transition-colors font-medium mt-0.5 block">{c.value}</a>
                    ) : (
                      <div className="text-sm text-gray-700 font-medium mt-0.5">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden border border-gray-200" style={{ height: '220px' }}>
              <img src="https://images.unsplash.com/photo-1639774275491-71d62502a4e0?w=500&h=300&fit=crop&auto=format" alt="Ibadan map area" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl">📍</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {[{ s: 'f', label: 'Facebook' }, { s: 'in', label: 'LinkedIn' }, { s: 'tw', label: 'Twitter' }, { s: 'ig', label: 'Instagram' }].map(({ s, label }) => (
                  <a key={s} href="#" aria-label={label} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-green-600 hover:text-white transition-all">{s}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {!user ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-5">🔒</div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Sign in to send a message</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                    Please log in or create a free account so our team can get back to you.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link to="/login?next=/contact" className="px-6 py-2.5 text-sm font-bold text-white rounded-xl" style={{ background: 'var(--color-gold-600)' }}>Sign In</Link>
                    <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl">Create Account</Link>
                  </div>
                </div>
              ) : sent ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-5">🎉</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Message Sent!</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSent(false)} className="mt-6 px-6 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: 'var(--color-gold-600)' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-6">Send Us a Message</h2>
                  {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Adebayo Olusanya" className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address *</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject</label>
                        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400 text-gray-700">
                          <option value="">Select a subject</option>
                          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message *</label>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us how we can help you..." className="w-full text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60" style={{ background: 'var(--color-gold-600)' }}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">FAQs</p>
            <h2 className="text-2xl font-black text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Are all property listings verified?', a: 'Yes. Every listing on OyoProperties is physically inspected and legally verified before going live on our platform.' },
              { q: 'How do I contact an agent?', a: 'Simply click on any property listing and you will find the agent\'s contact details and an inquiry form. You can also call or email them directly.' },
              { q: 'Is there a fee to list my property?', a: 'We offer both free and premium listing packages. Contact us to learn which option works best for you.' },
              { q: 'How quickly will I get a response?', a: 'Our team typically responds within 2–4 working hours. For urgent matters, please call us directly.' },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <span className="font-bold text-gray-900 text-sm">{question}</span>
        <span className="text-gray-400 text-lg shrink-0 ml-4 transition-transform" style={{ transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-gray-50">{answer}</div>}
    </div>
  )
}
