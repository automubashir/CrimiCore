'use client'
import { useState, useMemo } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterDropdown from '@/components/ui/FilterDropdown/FilterDropdown'
import NewsCard from '@/components/dashboard/NewsCard/NewsCard'
import NotFound from '@/components/ui/NotFound/NotFound'
import styles from './RecentNewsSection.module.css'

const DATE_OPTIONS = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 90 days']

const DATE_MS = {
  'Last 24 hours': 864e5,
  'Last 7 days':   6048e5,
  'Last 30 days':  2592e6,
  'Last 90 days':  7776e6,
}

function unique(arr) {
  return ['All', ...new Set(arr.filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b))
}

function withinRange(dateStr, range) {
  if (!range || range === 'All' || !dateStr) return true
  return Date.now() - new Date(dateStr).getTime() <= (DATE_MS[range] ?? Infinity)
}

export default function RecentNewsSection({ news = [] }) {
  const [search,    setSearch]    = useState('')
  const [country,   setCountry]   = useState(null)
  const [crimeType, setCrimeType] = useState(null)
  const [gang,      setGang]      = useState(null)
  const [dateRange, setDateRange] = useState(null)

  const countryOptions   = useMemo(() => unique(news.map(n => n.news?.country)), [news])
  const crimeTypeOptions = useMemo(() =>
    unique(news.flatMap(n => n.news?.crimeType?.split(',').map(s => s.trim()) ?? [])), [news])
  const gangOptions = useMemo(() =>
    unique(news.flatMap(n => n.news?.affiliation?.split(',').map(s => s.trim()) ?? [])), [news])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return news.filter(item => {
      const n = item.news
      if (q && !n.title?.toLowerCase()?.includes(q) && !n.description?.toLowerCase().includes(q)) return false
      if (country   && country   !== 'All' && n.country !== country) return false
      if (crimeType && crimeType !== 'All' && !n.crimeType?.split(',').map(s => s.trim()).includes(crimeType)) return false
      if (gang      && gang      !== 'All' && !n.affiliation?.split(',').map(s => s.trim()).includes(gang)) return false
      if (!withinRange(n.published_date, dateRange)) return false
      return true
    })
  }, [news, search, country, crimeType, gang, dateRange])

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Recent News</h2>
        <a href='/activities' className="linkButton" >View all</a>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          <div className={styles.search}>
            <SearchInput placeholder="Search news..." onSearch={setSearch} />
          </div>
          <div className={styles.drops}>
            <FilterDropdown
              label="Country"
              options={countryOptions}
              onChange={val => setCountry(val === 'All' ? null : val)}
            />
            <FilterDropdown
              label="Crime Type"
              options={crimeTypeOptions}
              onChange={val => setCrimeType(val === 'All' ? null : val)}
            />
            <FilterDropdown
              label="Gang"
              options={gangOptions}
              onChange={val => setGang(val === 'All' ? null : val)}
            />
            <FilterDropdown
              label="Criminal"
              options={[]}
            />
            <FilterDropdown
              label="Date Range"
              options={['All', ...DATE_OPTIONS]}
              onChange={val => setDateRange(val === 'All' ? null : val)}
            />
          </div>
          <div className={styles.newsList}>
            {filtered.length === 0 ? (
              <NotFound title="No news found" message="No articles match the current filters." />
            ) : (
              filtered.map((item, idx) => <NewsCard key={idx} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
