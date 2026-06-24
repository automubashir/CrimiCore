import GangDetailClient from './GangDetailClient'

export function generateStaticParams() { return [{ id: '_' }] }

export default function GangDetailPage() {
  return <GangDetailClient />
}
