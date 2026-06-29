import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AdminLayout, BDMLayout } from '@/layouts';
import { ProtectedRoute, RoleBasedRoute } from '@/routes';

// Placeholder page component (will be replaced in later modules)
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
      <p className="text-neutral-500">This page will be implemented in a future module.</p>
    </div>
  );
}

// Login page placeholder (will be replaced in Module 01)
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="glass rounded-2xl p-8 w-full max-w-md shadow-xl animate-slide-up">
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-6">Manika CRM</h1>
        <p className="text-neutral-500 text-center">Login will be implemented in Module 01 - Authentication</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin routes */}
        <Route element={<RoleBasedRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<PlaceholderPage title="Admin Dashboard" />} />
            <Route path="/geography/divisions" element={<PlaceholderPage title="Divisions" />} />
            <Route path="/geography/territories" element={<PlaceholderPage title="Territories" />} />
            <Route path="/geography/localities" element={<PlaceholderPage title="Localities" />} />
            <Route path="/crm/leads" element={<PlaceholderPage title="Leads" />} />
            <Route path="/crm/deals" element={<PlaceholderPage title="Deals" />} />
            <Route path="/partners" element={<PlaceholderPage title="Partners" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
            <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>

        {/* BDM routes */}
        <Route element={<RoleBasedRoute allowedRoles={['BDM']} />}>
          <Route element={<BDMLayout />}>
            <Route path="/dashboard" element={<PlaceholderPage title="BDM Dashboard" />} />
            <Route path="/crm/leads" element={<PlaceholderPage title="My Leads" />} />
            <Route path="/crm/deals" element={<PlaceholderPage title="My Deals" />} />
            <Route path="/partners" element={<PlaceholderPage title="Partners" />} />
            <Route path="/territory-map" element={<PlaceholderPage title="Territory Map" />} />
          </Route>
        </Route>
      </Route>

      {/* Unauthorized */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-danger-600 mb-2">403</h1>
            <p className="text-neutral-600">You don't have permission to access this page.</p>
          </div>
        </div>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
