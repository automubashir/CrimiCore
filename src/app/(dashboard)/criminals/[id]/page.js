import CriminalDetailClient from './CriminalDetailClient'

export function generateStaticParams() { return [{ id: '_' }] }

export default function CriminalDetailPage() {
  return <CriminalDetailClient />
}
