import ActivityDetailClient from './ActivityDetailClient'

export function generateStaticParams() { return [{ id: '_' }] }

export default function ActivityDetailPage() {
  return <ActivityDetailClient />
}
