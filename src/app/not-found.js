import NotFound from '@/components/ui/NotFound/NotFound'

export default function GlobalNotFound() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <NotFound
        title="Page not found"
        message="The page you are looking for does not exist or has been moved."
        href="/"
        linkLabel="Go to Dashboard"
      />
    </main>
  )
}
