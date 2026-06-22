'use client'

import { useMemo } from 'react'
import MediaTab from '@/components/shared/MediaTab/MediaTab'

const MEDIA_TITLE_POOL = [
  'Surveillance Footage',
  'Evidence Photo',
  'Crime Scene Documentation',
  'Arrest Record',
  'Confiscated Material',
  'Intelligence File',
  'Undercover Image',
  'Field Report',
  'Incident Record',
]

function buildMediaItems(criminal) {
  return criminal.media.map((url, i) => ({
    id: `${criminal.id}-media-${i + 1}`,
    image: url,
    title: `${MEDIA_TITLE_POOL[i % MEDIA_TITLE_POOL.length]} ${Math.floor(i / MEDIA_TITLE_POOL.length) > 0 ? Math.floor(i / MEDIA_TITLE_POOL.length) + 1 : ''}`.trim(),
    date: '01/02/2026',
  }))
}

export default function CriminalMediaTab({ criminal }) {
  const items = useMemo(() => buildMediaItems(criminal), [criminal])
  return <MediaTab items={items} />
}
