'use client'

import { useMemo } from 'react'
import MediaTab from '@/components/shared/MediaTab/MediaTab'

// Media is assembled from two sources: the gang's related news articles
// (thumbnail + title + date, built in GangDetailClient on `gang.media`) and
// the photos of its members (criminals affiliated with the gang).
export default function GangMediaTab({ gang, members = [] }) {
  const items = useMemo(() => {
    const newsMedia = gang?.media ?? []
    const memberMedia = members
      .filter(m => m.image)
      .map(m => ({ id: `member-${m.id}`, image: m.image, title: m.name, date: '—' }))
    return [...newsMedia, ...memberMedia]
  }, [gang, members])

  return <MediaTab items={items} showFilters={false} />
}
