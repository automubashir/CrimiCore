'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import CriminalItem from '@/components/criminals/CriminalItem/CriminalItem'
import LocationsMapTab from '@/components/activities/LocationsMapTab/LocationsMapTab'
import RelatedNewsTab from '@/components/activities/RelatedNewsTab/RelatedNewsTab'
import styles from './activity-detail.module.css'

const TABS = [
  { key: 'full-details', label: 'Full Details' },
  { key: 'locations-map', label: 'Locations & Map' },
  { key: 'related-news', label: 'Related News' }
]

const THUMB_LIMIT = 4

export default function ActivityDetailContent({ activity, relatedNews, similarNews = [], locationData = [], locationNews = [] }) {
  const [activeTab, setActiveTab] = useState('full-details')
  const [selectedThumb, setSelectedThumb] = useState(0)

  const visibleThumbs = activity.gallery.slice(0, THUMB_LIMIT)
  const hiddenCount = Math.max(0, activity.gallery.length - THUMB_LIMIT)

  return (
    <main className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <Link to="/activities" className={styles.backLink}>
          <ChevronLeftIcon />
          Back to Activities
        </Link>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>
        {/* ── Main content ── */}
        <div className={styles.main}>
          <div className={styles.summaryCard}>
            <div className={styles.detailsTitle}>
              <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>{activity.title}</h1>
              <Badge category={activity.category}>{activity.categoryLabel}</Badge>
              </div>
              <div className={styles.headerMeta}>
                <span className={styles.metaItem}>
                  <LocationIcon />
                  {activity.location}
                </span>
                <span className={styles.metaDivider} aria-hidden="true" />
                <span className={styles.metaItem}>
                  <CalendarIcon />
                  {activity.date}
                </span>
                <span className={styles.metaDivider} aria-hidden="true" />
                <span className={styles.metaItem}>
                  <GlobeIcon />
                  {activity.source}
                </span>
              </div>
            </div>
            {/* Top: gallery + summary */}
            <div className={styles.topSection}>
              {/* Image gallery */}
              <div className={styles.gallery}>
                <div className={styles.mainImageWrap}>
                  <SafeImage
                    key={selectedThumb}
                    src={activity.gallery[selectedThumb]}
                    alt={activity.title}
                    className={styles.mainImage}
                  />
                </div>

                <div className={styles.thumbnailStrip}>
                  {visibleThumbs.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.thumbBtn} ${i === selectedThumb ? styles.thumbActive : ''}`}
                      onClick={() => setSelectedThumb(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-pressed={i === selectedThumb}
                    >
                      <SafeImage src={src} alt="" className={styles.thumbImage} />
                      {i === THUMB_LIMIT - 1 && hiddenCount > 0 && (
                        <span className={styles.thumbMore} aria-hidden="true">
                          +{hiddenCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Summary</h2>
                <p className={styles.summaryText}>{activity.summary}</p>

                <div className={styles.metaGrid}>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Crime Type</span>
                    <Badge category={activity.category}>{activity.categoryLabel}</Badge>
                  </div>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Threat Level</span>
                    {activity.threatLevel ? (
                      <Badge threat={activity.threatLevel}>
                        {activity.threatLevel.charAt(0).toUpperCase() + activity.threatLevel.slice(1)}
                      </Badge>
                    ) : (
                      <span className={styles.metaCellValue}>—</span>
                    )}
                  </div>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Reporting Agency</span>
                    <span className={styles.metaCellValue}>{activity.reportingAgency}</span>
                  </div>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Date Published</span>
                    <span className={styles.metaCellValue}>{activity.datePublished}</span>
                  </div>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Criminals Mentioned</span>
                    <span className={styles.metaCellValue}>
                      {activity.criminals == null ? 'Unknown' : activity.criminals}
                    </span>
                  </div>
                  <div className={styles.metaCell}>
                    <span className={styles.metaCellLabel}>Location</span>
                    <span className={styles.metaCellValue}>
                      {activity.locationCity}, {activity.locationCountry}
                    </span>
                  </div>
                </div>

                <div className={styles.newsLinkRow}>
                  <span className={styles.metaCellLabel}>News Link</span>
                  <a
                    href={activity.newsLink}
                    className={styles.newsLinkAnchor}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activity.newsLink}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsArea}>
            <div className={styles.tabsBar} role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className={`${styles.tabContent} ${activeTab === 'locations-map' ? styles.tabContentFull : ''}`}
              role="tabpanel"
            >
              {activeTab === 'full-details' ? (
                <FullDetailsTab activity={activity} />
              ) : activeTab === 'locations-map' ? (
                <LocationsMapTab activity={activity} locations={locationData} locationNews={locationNews} />
              ) : activeTab === 'related-news' ? (
                <RelatedNewsTab similarNews={similarNews} />
              ):(<></>)}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          {/* Criminals Involved */}
          {activity.criminalsInvolved.length > 0 && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <span className={styles.sideCardTitle}>Criminals Involved</span>
                <span className={styles.countBadge}>{activity.criminalsInvolved.length}</span>
              </div>
              <ul className={styles.criminalsList}>
                {activity.criminalsInvolved.map((criminal) => (
                  <li key={criminal.id}>
                    <CriminalItem
                      name={criminal.name}
                      image={criminal.image}
                      city={criminal.city}
                      country={criminal.country}
                      threat={criminal.threat}
                      href={criminal.id ? `/criminals/${encodeURIComponent(criminal.id)}` : undefined}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <span className={styles.sideCardTitle}>Related News</span>
                <Link to="/activities" className={styles.viewAllLink}>
                  View All
                </Link>
              </div>
              <ul className={styles.relatedNewsList}>
                {relatedNews.map((news) => (
                  <li key={news.id}>
                    <Link to={`/activities/${encodeURIComponent(news.id)}`} className={styles.relatedNewsLink}>
                      <div className={styles.relatedNewsImageWrap}>
                        <SafeImage
                          src={news.image}
                          alt={news.title}
                          className={styles.relatedNewsImage}
                        />
                        <span className={styles.relatedNewsThreat}>
                          <Badge threat={news.threatLevel}>
                            {news.threatLevel === 'high'
                              ? 'High Threat'
                              : news.threatLevel === 'medium'
                                ? 'Medium Threat'
                                : 'Low Threat'}
                          </Badge>
                        </span>
                      </div>
                      <div className={styles.relatedNewsContent}>
                        <h4 className={styles.relatedNewsTitle}>{news.title}</h4>
                        <span className={styles.relatedNewsMeta}>
                          <LocationIcon />
                          {news.location}
                        </span>
                      </div>
                      <div>
                        <span className={styles.relatedNewsFooter}>
                          <CalendarIcon />
                          {news.date}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

function FullDetailsTab({ activity }) {
  return (
    <div className={styles.fullDetails}>
      <h2 className={styles.detailTitle}>{activity.title}</h2>

      <div className={styles.detailMeta}>
        <span className={styles.metaItem}>
          <LocationIcon />
          {activity.location}
        </span>
        <span className={styles.metaItem}>
          <CalendarIcon />
          {activity.date}
        </span>
        <span className={styles.metaItem}>
          <GlobeIcon />
          {activity.source}
        </span>
        {activity.author && (
          <span className={styles.metaItem}>
            <PenIcon />
            {activity.author}
          </span>
        )}
      </div>

      <div className={styles.detailBody}>
        {activity.fullText.map((para, i) => (
          <p key={i} className={styles.detailPara}>
            {para}
          </p>
        ))}
      </div>

      {activity.tags?.length > 0 && (
        <div className={styles.tagsSection}>
          <span className={styles.tagsLabel}>Tags:</span>
          {activity.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ComingSoonTab({ label }) {
  return (
    <div className={styles.comingSoon}>
      <ClockIcon className={styles.comingSoonIcon} />
      <span className={styles.comingSoonText}>{label} — Coming Soon</span>
      <span className={styles.comingSoonSub}>This section is under development.</span>
    </div>
  )
}

/* ── Inline SVG icons ── */

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function PenIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
