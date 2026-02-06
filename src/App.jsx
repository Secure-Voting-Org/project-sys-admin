import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Candidate from './pages/Candidate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="candidate" element={<Candidate />} />
          <Route path="candidates" element={<Candidate />} /> {/* Handle both plural/singular */}
          {/* Add more routes here as needed */}
          <Route path="users" element={<div className="p-4">User Management Module</div>} />
          <Route path="settings" element={<div className="p-4">Settings Module</div>} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
