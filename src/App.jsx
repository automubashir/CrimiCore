import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { CountryFilterProvider } from './context/CountryFilterContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import ActivitiesPage from './pages/ActivitiesPage';
import CriminalsPage from './pages/CriminalsPage';
import CriminalDetailPage from './pages/CriminalDetailPage';
import GangsPage from './pages/GangsPage';
import GangDetailPage from './pages/GangDetailPage';
import NewsDetailPage from './pages/NewsDetailPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('cc_auth') === 'true'
  );

  function handleLogin() {
    localStorage.setItem('cc_auth', 'true');
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem('cc_auth');
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <CountryFilterProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout onLogout={handleLogout} />}>
              <Route path="/" element={<ActivitiesPage />} />
              <Route path="/criminals" element={<CriminalsPage />} />
              <Route path="/criminals/:name" element={<CriminalDetailPage />} />
              <Route path="/gangs" element={<GangsPage />} />
              <Route path="/gangs/:name" element={<GangDetailPage />} />
              <Route path="/news/detail" element={<NewsDetailPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </CountryFilterProvider>
    </BrowserRouter>
  );
}
