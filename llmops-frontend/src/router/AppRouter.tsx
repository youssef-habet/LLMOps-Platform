import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import AccountPage from '../pages/AccountPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ModelsPage from '../pages/ModelsPage';
import DatasetsPage from '../pages/DatasetsPage';
import MetricsPage from '../pages/MetricsPage';
import EvaluationsPage from '../pages/evaluationsPage';
import ExperimentsPage from '../pages/experiments/ExperimentsPage';
import ExperimentDashboardPage from '../pages/experiments/ExperimentDashboardPage';


export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/datasets" element={<DatasetsPage/>} />
              <Route path="/metrics"  element={<MetricsPage/>} />
              <Route path="/evaluations" element={<EvaluationsPage/>} />
              <Route path="/experiments" element={<ExperimentsPage/>} />
              <Route path="/experiments/:id" element={<ExperimentDashboardPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
