'use client'
import { useState, useMemo } from 'react'
import RelatedNewsCard from '@/components/activities/RelatedNewsCard/RelatedNewsCard'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import styles from './RelatedNewsTab.module.css'

const THREAT_OPTIONS = ['High', 'Medium', 'Low']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RelatedNewsTab({ similarNews = [], height = '26rem' }) {
  const [search, setSearch] = useState('')

  const items = useMemo(() =>
    similarNews.map((n, i) => ({
      id:            i,
      image:         null,
      reporter:      null,
      category:      'general',
      categoryLabel: 'General',
      title:         n.title ?? '—',
      description:   '',
      location:      '—',
      date:          formatDate(n.published_date),
    })),
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
        </div>
      )}
    </div>
  )
}
