import { notFound } from 'next/navigation'
import { ACTIVITIES, getActivityById } from '@/lib/data/activities'
import ActivityDetailContent from './ActivityDetailContent'

export async function generateMetadata({ params }) {
  const { id } = await params
  const activity = getActivityById(id)
  if (!activity) return { title: 'Not Found | CrimePanel' }
  return { title: `${activity.title} | CrimePanel` }
}

export default async function ActivityDetailPage({ params }) {
  const { id } = await params
  const activity = getActivityById(id)

  if (!activity) notFound()

  const relatedNews = (activity.relatedNewsIds ?? [])
    .map((rid) => ACTIVITIES.find((a) => a.id === rid))
    .filter(Boolean)
    .slice(0, 3)

  return <ActivityDetailContent activity={activity} relatedNews={relatedNews} />
}
