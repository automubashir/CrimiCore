import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { getSession } from '@/lib/session'
import Header from '@/components/layout/Header/Header'

import LoginPage        from './app/(auth)/login/page'
import HomePage         from './app/(dashboard)/page'
import CriminalsPage    from './app/(dashboard)/criminals/page'
import CriminalDetail   from './app/(dashboard)/criminals/[id]/CriminalDetailClient'
import GangsPage        from './app/(dashboard)/gangs/page'
import GangDetail       from './app/(dashboard)/gangs/[id]/GangDetailClient'
import ActivitiesPage   from './app/(dashboard)/activities/page'
import ActivityDetail   from './app/(dashboard)/activities/[id]/ActivityDetailClient'
import HeatmapPage      from './app/(dashboard)/heatmap/page'

function ProtectedLayout() {
  if (!getSession()) return <Navigate to="/login" replace />
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

function LoginRoute() {
  if (getSession()) return <Navigate to="/" replace />
  return <LoginPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/"               element={<HomePage />}       />
          <Route path="/criminals"      element={<CriminalsPage />}  />
          <Route path="/criminals/:id"  element={<CriminalDetail />} />
          <Route path="/gangs"          element={<GangsPage />}      />
          <Route path="/gangs/:id"      element={<GangDetail />}     />
          <Route path="/activities"     element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/heatmap"        element={<HeatmapPage />}    />
          <Route path="/reports"   element={<PlaceholderPage label="Reports" />}  />
          <Route path="/settings"  element={<PlaceholderPage label="Settings" />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function PlaceholderPage({ label }) {
  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      {label} — coming soon.
    </div>
  )
}
