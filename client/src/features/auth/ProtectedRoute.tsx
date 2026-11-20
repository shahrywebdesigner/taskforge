import { Navigate, Outlet } from 'react-router'
import { useAuth } from './useAuth'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  // Authentication check complete hone ka wait
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </div>
    )
  }

  // User login nahi hai to Login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated user ko nested routes access mil jayega
  return <Outlet />
}

export default ProtectedRoute