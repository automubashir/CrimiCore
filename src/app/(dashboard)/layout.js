import Header from '@/components/layout/Header/Header'

export default function DashboardLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
