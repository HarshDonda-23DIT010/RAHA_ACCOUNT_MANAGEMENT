import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Section    from './pages/Section';
import PartyDetail from './pages/PartyDetail';
import Profile    from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-600 to-pink-400">
      <div className="text-center text-white">
        <div className="text-5xl mb-4 animate-bounce">💄</div>
        <p className="font-semibold text-lg">Loading…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"         element={<Login />} />
      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/section/:section" element={<ProtectedRoute><Section /></ProtectedRoute>} />
      <Route path="/party/:id"     element={<ProtectedRoute><PartyDetail /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*"              element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="w-full min-h-screen bg-gray-50 relative">
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '14px' },
              success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
              error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
            }}
          />
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
