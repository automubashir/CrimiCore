'use client'
import { useState, useMemo } from 'react'
import RelatedNewsCard from '@/components/activities/RelatedNewsCard/RelatedNewsCard'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import ScrollLoader from '@/components/ui/ScrollLoader/ScrollLoader'
import styles from './RelatedNewsTab.module.css'

const THREAT_OPTIONS = ['High', 'Medium', 'Low']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RelatedNewsTab({
  similarNews   = [],
  height        = '26rem',
  hasMore       = false,
  loadingMore   = false,
  onLoadMore,
}) {
  const [search, setSearch] = useState('')

  const items = useMemo(() =>
    similarNews.map((n, i) => {
      const firstCrime = n.crimeType?.split(',')[0]?.trim() || 'General'
      return {
        id:            n.news_link || i,
        image:         n.thumbnail ?? null,
        reporter:      null,
        category:      firstCrime.toLowerCase().replace(/\s+/g, '-'),
        categoryLabel: firstCrime,
        title:         n.title ?? '—',
        description:   '',
        location:      n.country ?? '—',
        date:          formatDate(n.published_date),
      }
    }),
    [similarNews]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(a => a.title.toLowerCase().includes(q))
  }, [items, search])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Related News</h3>
        <div className={styles.searchWrap}>
          <SearchInput placeholder="Search News" onSearch={setSearch} />
        </div>
      </div>

      <div className={styles.filters}>
        <FilterSelect label="Country/Region"  placeholder="Any" options={[]} />
        <FilterSelect label="Crime Type"      placeholder="Any" options={[]} />
        <FilterSelect label="Threat Levels"   placeholder="Any" options={THREAT_OPTIONS} />
        <FilterSelect label="Criminal"        placeholder="Mentioned Criminals" options={[]} />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No related news available.</p>
      ) : (
        <div className={styles.grid} style={{ maxHeight: height }}>
          {filtered.map(a => (
            <RelatedNewsCard
              key={a.id}
              id={a.id}
              image={a.image}
              reporter={a.reporter}
              category={a.category}
              categoryLabel={a.categoryLabel}
              title={a.title}
              description={a.description}
              location={a.location}
              date={a.date}
            />
          ))}
          {onLoadMore && (
            <ScrollLoader
              onLoad={onLoadMore}
              loading={loadingMore}
              hasMore={hasMore}
              style={{ gridColumn: '1 / -1' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
