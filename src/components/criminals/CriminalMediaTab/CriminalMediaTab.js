'use client'

import MediaTab from '@/components/shared/MediaTab/MediaTab'

// Media is derived from the criminal's news articles (thumbnail + title + date),
// assembled in CriminalDetailClient and passed through on `criminal.media`.
export default function CriminalMediaTab({ criminal }) {
  return <MediaTab items={criminal?.media ?? []} showFilters={false} />
}
