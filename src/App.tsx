import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Permission } from '@/types/Permissions'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import TenantRegistration from '@/pages/TenantRegistration'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Appointments from '@/pages/Appointments'
import AdminDashboard from '@/pages/AdminDashboard'
import Users from '@/pages/Users'
import DebugPermissions from '@/pages/DebugPermissions'

/**
 * Root React component that configures providers and client-side routes.
 *
 * Wraps the app in an ErrorBoundary, ChakraProvider (theme), and AuthProvider, then defines routes
 * inside a BrowserRouter. Exposes public routes (/, /forgot-password, /tenant-registration) and
 * protected application routes under /app, /app/clients, /app/appointments, /admin, /users, and
 * /debug-permissions. Protected routes are enforced via ProtectedRoute and may require authentication,
 * admin access, or specific Permission enum values (e.g., CLIENTS_VIEW, APPOINTMENTS_VIEW, USERS_VIEW).
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/tenant-registration" element={<TenantRegistration />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/clients"
                element={
                  <ProtectedRoute permission={Permission.CLIENTS_VIEW}>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/appointments"
                element={
                  <ProtectedRoute permission={Permission.APPOINTMENTS_VIEW}>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute permission={Permission.USERS_VIEW}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debug-permissions"
                element={
                  <ProtectedRoute>
                    <DebugPermissions />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  )
}
