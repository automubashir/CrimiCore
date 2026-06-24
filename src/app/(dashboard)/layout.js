import AuthGuard from '@/components/layout/AuthGuard/AuthGuard'
import Header from '@/components/layout/Header/Header'

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <Header />
      {children}
    </AuthGuard>
  )
}
