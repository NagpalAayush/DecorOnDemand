import { Navigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
