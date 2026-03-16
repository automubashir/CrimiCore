import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CountryFilterProvider } from './context/CountryFilterContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import ActivitiesPage from './pages/ActivitiesPage';
import CriminalsPage from './pages/CriminalsPage';
import CriminalDetailPage from './pages/CriminalDetailPage';
import GangsPage from './pages/GangsPage';
import GangDetailPage from './pages/GangDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <CountryFilterProvider>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<ActivitiesPage />} />
              <Route path="/criminals" element={<CriminalsPage />} />
              <Route path="/criminals/:name" element={<CriminalDetailPage />} />
              <Route path="/gangs" element={<GangsPage />} />
              <Route path="/gangs/:name" element={<GangDetailPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </CountryFilterProvider>
    </BrowserRouter>
  );
}
