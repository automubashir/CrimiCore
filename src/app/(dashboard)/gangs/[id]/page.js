import { notFound } from 'next/navigation'
import { getGangById } from '@/lib/data/gangs'
import GangDetailContent from './GangDetailContent'

export async function generateMetadata({ params }) {
  const { id } = await params
  const gang = getGangById(id)
  if (!gang) return { title: 'Gang Not Found | CrimePanel' }
  return { title: `${gang.name} | CrimePanel` }
}

export default async function GangDetailPage({ params }) {
  const { id } = await params
  const gang = getGangById(id)
  if (!gang) notFound()

  return <GangDetailContent gang={gang} />
}
