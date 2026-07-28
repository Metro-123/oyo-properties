import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="inline-block mb-5">
              <Logo size="sm" white />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your trusted property partner across Ibadan and Oyo State. Verified listings, expert
              agents, stress-free transactions.
            </p>
            <div className="flex gap-3">
              {[
                { s: 'f', label: 'Facebook' },
                { s: 'in', label: 'LinkedIn' },
                { s: 'tw', label: 'Twitter' },
                { s: 'ig', label: 'Instagram' },
              ].map(({ s, label }) => (
                <a
                  key={s}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:bg-green-600 hover:text-white transition-all"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Properties', to: '/properties' },
                { label: 'Find Agents', to: '/about#agents' },
                { label: 'List Your Property', to: '/contact' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5">
              {['Buying Guide', 'Renting Guide', 'Investment Tips', 'FAQs', 'Blog'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Bodija Estate, Ibadan, Oyo State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+2348012345678" className="hover:text-green-400 transition-colors">
                  +234 801 234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a
                  href="mailto:info@oyoproperties.ng"
                  className="hover:text-green-400 transition-colors"
                >
                  info@oyoproperties.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© 2026 OyoProperties. All rights reserved.</span>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className="hover:text-green-400 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
