import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// System Admin Pages
import UserIntegrity from './pages/UserIntegrity';
import AdminManagement from './pages/AdminManagement';
import SystemHealth from './pages/SystemHealth';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import ElectoralRoll from './pages/ElectoralRoll';
import ObserverManagement from './pages/ObserverManagement';

// Protected Route Component
const ProtectedRoute = () => {
  const user = localStorage.getItem('adminUser');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            {/* Access Control */}
            <Route path="users" element={<UserIntegrity />} />
            <Route path="admins" element={<AdminManagement />} />

            {/* Monitoring */}
            <Route path="health" element={<SystemHealth />} />
            <Route path="audit-logs" element={<AuditLogs />} />

            {/* Configuration */}
            <Route path="settings" element={<Settings />} />

            {/* Electoral Roll & Observers */}
            <Route path="electoral-roll" element={<ElectoralRoll />} />
            <Route path="observers" element={<ObserverManagement />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
