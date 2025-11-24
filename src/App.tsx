import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionStart from './pages/ReceptionStart';
import ComingSoon from './pages/ComingSoon';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception"
          element={
            <ProtectedRoute>
              <ReceptionStart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception/scan"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Escaneo de Productos"
                description="La funcionalidad de escaneo de productos está en desarrollo. Pronto podrás registrar productos escaneando códigos QR."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatch"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Módulo de Despacho"
                description="El módulo de despacho está en desarrollo. Aquí podrás gestionar órdenes de picking y preparación de envíos."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/query"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Consulta Rápida"
                description="La funcionalidad de consulta rápida está en desarrollo. Pronto podrás buscar productos y ubicaciones al instante."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Reportar Incidencias"
                description="El módulo de reportes está en desarrollo. Aquí podrás reportar problemas y discrepancias en el inventario."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <ComingSoon
                title="Mis Tareas"
                description="La vista detallada de tareas está en desarrollo. Aquí verás todas tus asignaciones pendientes."
              />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard or login */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
