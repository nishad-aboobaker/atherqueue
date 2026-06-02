import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MapPage from './pages/MapPage'
import QueuePage from './pages/QueuePage'
import ClaimPage from './pages/ClaimPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Screen */}
        <Route path='/auth' element={<AuthPage />} />

        {/* Public Claim link from email (cryptographically secured by unique token) */}
        <Route path='/claim/:token' element={<ClaimPage />} />

        {/* Protected Customer Routes */}
        <Route 
          path='/' 
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/queue/:queueId' 
          element={
            <ProtectedRoute>
              <QueuePage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to map */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
