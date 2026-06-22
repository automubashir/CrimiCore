import { notFound } from 'next/navigation'
import { getCriminalById } from '@/lib/data/criminals'
import CriminalDetailContent from './CriminalDetailContent'

export async function generateMetadata({ params }) {
  const { id } = await params
  const criminal = getCriminalById(id)
  if (!criminal) return { title: 'Criminal Not Found | CrimePanel' }
  return { title: `${criminal.name} | CrimePanel` }
}

export default async function CriminalDetailPage({ params }) {
  const { id } = await params
  const criminal = getCriminalById(id)
  if (!criminal) notFound()

  return <CriminalDetailContent criminal={criminal} />
}
