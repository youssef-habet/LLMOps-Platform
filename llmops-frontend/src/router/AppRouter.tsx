import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ModelsPage from '../pages/ModelsPage';
import DatasetsPage from '../pages/DatasetsPage';
import MetricsPage from '../pages/MetricsPage';
import EvaluationsPage from '../pages/evaluationsPage';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/datasets" element={<DatasetsPage/>} />
          <Route path="/metrics"  element={<MetricsPage/>} />
          
          <Route path="/evaluations" element={<EvaluationsPage/>} />
          <Route path="/support" element={<div className="text-gray-500 dark:text-gray-400">Contact Support Page...</div>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/models" replace />} />
      </Routes>
    </BrowserRouter>
  );
}