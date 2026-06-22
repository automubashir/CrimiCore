'use client'

import { useState, useMemo } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import DateRangePicker from '@/components/ui/DateRangePicker/DateRangePicker'
import styles from './CrimesTab.module.css'

/* ── Constants ── */

const REPORT_FILTERS = [
  { key: 'news',       label: 'News',           count: 68 },
  { key: 'tweets',     label: 'Tweets',         count: 68 },
  { key: 'vlogs',      label: 'Vlogs / Videos', count: 68 },
  { key: 'editorials', label: 'Editorials',     count: 68 },
]

const CRIME_TYPE_OPTIONS = [
  'All Crimes', 'Drug Trafficking', 'Robbery', 'Arson',
  'Cyber Attack', 'Vandalism', 'Murder', 'Extortion',
]

const MOCK_CRIME_REPORTS = [
  { id: 1,  category: 'arson',        title: 'Arson at Riverside Warehouse',            description: 'A fire deliberately set at a warehouse storing chemicals caused extensive damage. Investigation ongoing to identify the perpetrators.',                              location: 'Riverside, USA',          date: 'May 15, 2025', source: 'Reuters',    image: 'https://picsum.photos/seed/rep-01/320/200' },
  { id: 2,  category: 'cyber-attack', title: 'Cyber Attack on Regional Hospital Network', description: 'A ransomware attack disrupted operations across several hospitals, compromising patient data and system functional.',                                            location: 'Downtown, Chicago, USA',  date: 'May 19, 2025', source: 'BBC News',   image: 'https://picsum.photos/seed/rep-02/320/200' },
  { id: 3,  category: 'vandalism',    title: 'Vandalism Incident at Central City Park',   description: 'Multiple statues and benches were defaced overnight at Central City Park. Authorities are reviewing surveillance footage.',                                    location: 'Downtown, Chicago, USA',  date: 'May 19, 2025', source: 'BBC News',   image: 'https://picsum.photos/seed/rep-03/320/200' },
  { id: 4,  category: 'vandalism',    title: 'Vandalism Incident at Central City Park',   description: 'Multiple statues and benches were defaced overnight at Central City Park. Authorities are reviewing surveillance footage.',                                    location: 'Downtown, Chicago, USA',  date: 'May 19, 2025', source: 'BBC News',   image: 'https://picsum.photos/seed/rep-04/320/200' },
  { id: 5,  category: 'robbery',      title: 'Armed Robbery at Downtown Commercial Bank', description: 'Three masked suspects armed with firearms robbed the First National Bank in downtown Chicago. No injuries were reported.',                                      location: 'Downtown, Chicago, USA',  date: 'May 17, 2025', source: 'CNN',        image: 'https://picsum.photos/seed/rep-05/320/200' },
  { id: 6,  category: 'arson',        title: 'Suspicious Fire Destroys Industrial Complex', description: 'Investigators suspect deliberate arson after a fire consumed a large industrial complex, causing millions in damage.',                                      location: 'Houston, Texas, USA',     date: 'May 14, 2025', source: 'Reuters',    image: 'https://picsum.photos/seed/rep-06/320/200' },
  { id: 7,  category: 'cyber-attack', title: 'Data Breach Exposes Millions of Customer Records', description: 'Hackers infiltrated a major financial institution, exfiltrating millions of records including personal and financial data.',                            location: 'New York, USA',           date: 'May 12, 2025', source: 'BBC News',   image: 'https://picsum.photos/seed/rep-07/320/200' },
  { id: 8,  category: 'robbery',      title: 'Jewelry Store Heist in Downtown District',  description: 'Coordinated criminals staged a high-profile heist at a luxury jewelry store, making off with valuables exceeding $2 million.',                               location: 'Los Angeles, USA',        date: 'May 10, 2025', source: 'AP News',    image: 'https://picsum.photos/seed/rep-08/320/200' },
  { id: 9,  category: 'vandalism',    title: 'Gang Tags Deface Public Monuments',         description: 'Multiple government buildings and public monuments were tagged overnight with gang symbols, believed to be territorial markings.',                              location: 'Miami, Florida, USA',     date: 'May 8, 2025',  source: 'Local News', image: 'https://picsum.photos/seed/rep-09/320/200' },
  { id: 10, category: 'arson',        title: 'Vehicle Arson Targets Police Precinct',     description: 'Three police vehicles were set on fire in the precinct parking lot, an apparent act of retaliation against ongoing drug enforcement operations.',             location: 'Culiacán, Mexico',        date: 'May 5, 2025',  source: 'Univision',  image: 'https://picsum.photos/seed/rep-10/320/200' },
  { id: 11, category: 'robbery',      title: 'Pharmacy Chain Hit by Organized Theft Ring', description: 'A coordinated theft ring struck several pharmacy locations simultaneously, stealing controlled substances and cash.',                                         location: 'Chicago, Illinois, USA',  date: 'May 3, 2025',  source: 'NBC News',   image: 'https://picsum.photos/seed/rep-11/320/200' },
  { id: 12, category: 'cyber-attack', title: 'Government Portal Hacked, Services Down',   description: 'A sophisticated cyber attack took down several critical government online services for over 48 hours, disrupting public access.',                            location: 'Washington D.C., USA',   date: 'Apr 28, 2025', source: 'Reuters',    image: 'https://picsum.photos/seed/rep-12/320/200' },
]

const CATEGORY_META = {
  'arson':        { label: 'Arson',        cls: styles.catArson       },
  'cyber-attack': { label: 'Cyber Attack', cls: styles.catCyberAttack },
  'vandalism':    { label: 'Vandalism',    cls: styles.catVandalism   },
  'robbery':      { label: 'Robbery',      cls: styles.catRobbery     },
  'murder':       { label: 'Murder',       cls: styles.catMurder      },
  'extortion':    { label: 'Extortion',    cls: styles.catExtortion   },
}

const STATUS_CLS = {
  Active:     styles.statusActive,
  Convicted:  styles.statusConvicted,
  'In-Trial': styles.statusInTrial,
  Arrested:   styles.statusArrested,
}

const PAGE_SIZE     = 5
const TOTAL_RECORDS = 2480

/* ── History builder (deterministic from criminal data) ── */
function buildCriminalHistory(criminal) {
  const locs     = ['USA', 'USA', 'Mexico', 'Mexico', 'Colombia']
  const statuses = ['Active', 'Active', 'Convicted', 'Convicted', 'Convicted']
  const years    = [2023, 2022, 2021, 2018, 2016]
  return criminal.crimesInvolved.slice(0, 5).map((charge, i) => ({
    id: i + 1,
    charge,
    location: locs[i] ?? 'Unknown',
    year:     years[i],
    status:   statuses[i] ?? 'Convicted',
  }))
}

/* ── Root component ── */
export default function CrimesTab({ criminal }) {
  const history = useMemo(() => buildCriminalHistory(criminal), [criminal])

  return (
    <>
      <div className={styles.topGrid}>
        <CriminalHistoryCard history={history} />
        <CrimesInvolvedCard crimes={criminal.crimesInvolved} />
      </div>
      <CrimeReportsSection />
    </>
  )
}

/* ── Criminal History ── */
function CriminalHistoryCard({ history }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>Criminal History</span>
        <span className={styles.cardSubtitle}>
          Chronological timeline of cases, the criminal is involved in
        </span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.th}>Charge</th>
              <th className={`${styles.th} ${styles.thCenter}`}>Location</th>
              <th className={`${styles.th} ${styles.thCenter}`}>Year</th>
              <th className={`${styles.th} ${styles.thRight}`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(row => (
              <tr key={row.id} className={styles.historyRow}>
                <td className={styles.td}>{row.charge}</td>
                <td className={`${styles.td} ${styles.tdCenter}`}>{row.location}</td>
                <td className={`${styles.td} ${styles.tdCenter}`}>{row.year}</td>
                <td className={`${styles.td} ${styles.tdRight} ${STATUS_CLS[row.status] ?? styles.statusConvicted}`}>
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Crimes Involved ── */
function CrimesInvolvedCard({ crimes }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>Crimes Involved</span>
        <span className={styles.cardSubtitle}>
          Crimes in which target is involved in some capacity.
        </span>
      </div>
      <div className={styles.crimeTagsWrap}>
        {crimes.map(c => (
          <span key={c} className={styles.crimeTag}>{c}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Crime Reports section ── */
function CrimeReportsSection() {
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('news')
  const [crimeType,    setCrimeType]    = useState('All Crimes')
  const [currentPage,  setCurrentPage]  = useState(1)

  const filtered = useMemo(() => {
    return MOCK_CRIME_REPORTS.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      if (crimeType !== 'All Crimes') {
        const slug = crimeType.toLowerCase().replace(' ', '-')
        if (r.category !== slug) return false
      }
      return true
    })
  }, [search, crimeType])

  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const showFrom  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showTo    = Math.min(currentPage * PAGE_SIZE, TOTAL_RECORDS)

  function handleFilterChange(key) {
    setActiveFilter(key)
    setCurrentPage(1)
  }

  function handleCrimeTypeChange(val) {
    setCrimeType(val)
    setCurrentPage(1)
  }

  return (
    <div className={styles.reportsSection}>
      {/* Header */}
      <div className={styles.reportsHeader}>
        <span className={styles.reportsSectionTitle}>Crime Reports</span>
        <div className={styles.reportsHeaderControls}>
          <div className={styles.searchWrap}>
            <SearchInput placeholder="Search Crime" onSearch={setSearch} />
          </div>
          <DateRangePicker
            defaultFrom="2025-01-01"
            defaultTo="2025-02-01"
          />
        </div>
      </div>

      {/* Filter tabs + crime type */}
      <div className={styles.filtersRow}>
        <div className={styles.filterTabs} role="tablist">
          {REPORT_FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === f.key}
              className={`${styles.filterTab} ${activeFilter === f.key ? styles.filterTabActive : ''}`}
              onClick={() => handleFilterChange(f.key)}
            >
              <FilterIcon type={f.key} active={activeFilter === f.key} />
              <span>{f.label}</span>
              <span className={styles.filterCount}>{f.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.crimeTypeWrap}>
          <span className={styles.crimeTypeLabel}>Crime Type:</span>
          <div className={styles.crimeTypeSelect}>
            <select
              value={crimeType}
              onChange={e => handleCrimeTypeChange(e.target.value)}
              className={styles.crimeTypeNative}
            >
              {CRIME_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={styles.reportsList}>
        {pageItems.length > 0 ? (
          pageItems.map(report => (
            <CrimeReportItem key={report.id} report={report} />
          ))
        ) : (
          <p className={styles.emptyState}>No crime reports match your search.</p>
        )}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        showFrom={showFrom}
        showTo={showTo}
        total={TOTAL_RECORDS}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

/* ── Crime report item ── */
function CrimeReportItem({ report }) {
  const meta = CATEGORY_META[report.category]

  return (
    <div className={styles.reportItem}>
      <img
        src={report.image}
        alt={report.title}
        className={styles.reportThumb}
        width={160}
        height={100}
      />
      <div className={styles.reportBody}>
        {meta && (
          <span className={`${styles.catBadge} ${meta.cls}`}>{meta.label}</span>
        )}
        <span className={styles.reportTitle}>{report.title}</span>
        <span className={styles.reportDesc}>{report.description}</span>
        <div className={styles.reportFooter}>
          {report.location && (
            <span className={styles.reportMeta}><PinIcon />{report.location}</span>
          )}
          {report.date && (
            <span className={styles.reportMeta}><CalendarIcon />{report.date}</span>
          )}
          {report.source && (
            <span className={styles.reportMeta}><GlobeIcon />{report.source}</span>
          )}
        </div>
      </div>
      <button className={styles.reportArrowBtn} type="button" aria-label="View report">
        <ArrowRightIcon />
      </button>
    </div>
  )
}

/* ── Pagination bar ── */
const VISIBLE_PAGES = [1, 2, 3, 4, 5]
const LAST_PAGE     = 16

function PaginationBar({ currentPage, showFrom, showTo, total, onPageChange }) {
  return (
    <div className={styles.paginationBar}>
      <span className={styles.paginationInfo}>
        Showing {showFrom}-{showTo} of {total.toLocaleString()} activities
      </span>

      <div className={styles.paginationPages}>
        <button
          type="button"
          className={styles.pageNavBtn}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon /> Prev
        </button>

        {VISIBLE_PAGES.map(p => (
          <button
            key={p}
            type="button"
            className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <span className={styles.pageEllipsis} aria-hidden="true">...</span>

        <button
          type="button"
          className={`${styles.pageBtn} ${currentPage === LAST_PAGE ? styles.pageBtnActive : ''}`}
          onClick={() => onPageChange(LAST_PAGE)}
        >
          {LAST_PAGE}
        </button>

        <button
          type="button"
          className={styles.pageNavBtn}
          onClick={() => onPageChange(Math.min(LAST_PAGE, currentPage + 1))}
          disabled={currentPage === LAST_PAGE}
        >
          Next <ChevronRightIcon />
        </button>
      </div>

      <div className={styles.pageSizeWrap}>
        <select className={styles.pageSizeNative} defaultValue="20">
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
        <ChevronDownIcon />
      </div>
    </div>
  )
}

/* ── Filter tab icons ── */
function FilterIcon({ type, active }) {
  const color = active ? 'var(--text-brand)' : 'currentColor'
  switch (type) {
    case 'news':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'tweets':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'vlogs':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="3" fill={active ? 'var(--text-brand)' : '#F2464A'} opacity="0.9" />
          <polygon points="10,9 10,15 16,12" fill="#fff" />
        </svg>
      )
    case 'editorials':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    default:
      return null
  }
}

/* ── Inline SVG icons ── */
function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
