import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import api from '../lib/api.js'

function AdminProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let isMounted = true

    api.get('/api/users/admin/verify')
      .then(() => {
        if (isMounted) setStatus('allowed')
      })
      .catch(() => {
        if (isMounted) setStatus('denied')
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (status === 'checking') {
    return <main className="grid min-h-[calc(100vh-125px)] place-items-center text-sm text-[#766a60]">Verifying administrator access...</main>
  }

  if (status === 'denied') {
    return <Navigate to="/account" replace />
  }

  return children
}

export default AdminProtectedRoute
