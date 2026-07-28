import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

type User = { id: string; email: string } | null

export default function Navbar({ user, isAdmin, onSignOut }: { user: User; isAdmin?: boolean; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignOut()
    setDropOpen(false)
    navigate('/')
  }

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium transition-colors"
              style={{ color: isActive(l.to) ? '#16a34a' : '#4b5563' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <Link to="/list-property" className="px-3 py-2 text-sm font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-all">List a Property</Link>
          )}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#16a34a' }}
                >
                  {user.email[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 max-w-[140px] truncate">{user.email}</span>
                <span className="text-gray-400 text-xs">{dropOpen ? '▴' : '▾'}</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      <span>🛡️</span> Admin Dashboard
                    </Link>
                  )}
                  {!isAdmin && (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span>🔖</span> Saved Listings
                      </Link>
                      <Link
                        to="/account?tab=inquiries"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span>📋</span> My Inquiries
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    <span>↩</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: '#16a34a' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-1.5"
              style={{ color: isActive(l.to) ? '#16a34a' : '#374151' }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="text-sm font-bold py-1.5 text-green-700"
            >
              🛡️ Admin Dashboard
            </Link>
          )}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
              {user ? (
                <Link to="/list-property" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-all">List a Property</Link>
              ) : null}
              {user ? (
                <button
                onClick={handleSignOut}
                className="flex-1 py-2.5 text-sm font-medium border border-red-200 text-red-500 rounded-lg"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg text-center"
                  style={{ background: '#16a34a' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
