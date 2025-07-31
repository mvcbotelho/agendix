

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import TenantRegistration from '@/pages/TenantRegistration'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Appointments from '@/pages/Appointments'

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
                  <ProtectedRoute>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
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
