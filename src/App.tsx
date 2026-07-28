import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { api } from './lib/api'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import Account from './pages/Account'
import ListProperty from './pages/ListProperty'
import RequireAuth from './components/RequireAuth'

type User = { id: string; email: string } | null

function Layout({ user, isAdmin, onSignOut, children }: { user: User; isAdmin: boolean; onSignOut: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar user={user} isAdmin={isAdmin} onSignOut={onSignOut} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {children}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<User>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const syncUser = (nextUser: User) => {
      setUser(nextUser)
      if (nextUser) {
        api.profiles.get(nextUser.id).then((profile: any) => setIsAdmin(Boolean(profile?.is_admin))).catch(() => setIsAdmin(false))
      } else {
        setIsAdmin(false)
      }
    }
    supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email! } : null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      syncUser(session?.user ? { id: session.user.id, email: session.user.email! } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = () => { setUser(null); setIsAdmin(false) }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
        <Route path="/admin" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><Admin /></Layout>} />
        <Route path="/saved" element={<Navigate to="/account" replace />} />
        <Route path="/account" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><RequireAuth user={user} authReady={authReady}><Account /></RequireAuth></Layout>} />
        <Route path="/list-property" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><ListProperty /></Layout>} />
        <Route path="/" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><Home user={user} /></Layout>} />
        <Route path="/properties" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><RequireAuth user={user} authReady={authReady}><Properties /></RequireAuth></Layout>} />
        <Route path="/properties/:id" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><RequireAuth user={user} authReady={authReady}><PropertyDetail /></RequireAuth></Layout>} />
        <Route path="/about" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><About /></Layout>} />
        <Route path="/contact" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><Contact user={user} /></Layout>} />
        <Route path="*" element={<Layout user={user} isAdmin={isAdmin} onSignOut={handleSignOut}><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏚️</div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block px-6 py-3 text-sm font-bold text-white rounded-xl" style={{ background: '#16a34a' }}>
          Go Home
        </a>
      </div>
    </div>
  )
}
