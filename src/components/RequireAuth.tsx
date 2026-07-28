import { Navigate, useLocation } from 'react-router-dom'

type User = { id: string; email: string } | null

export default function RequireAuth({ user, authReady, children }: { user: User; authReady: boolean; children: React.ReactNode }) {
  const location = useLocation()

  if (!authReady) {
    return <div className="py-24 text-center text-sm text-gray-500">Checking your account...</div>
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <>{children}</>
}
