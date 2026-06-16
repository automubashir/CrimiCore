'use client'

import { useState, useMemo } from 'react'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import styles from './GangMediaTab.module.css'

/* ── Mock media keyed by gang id ── */

function makeMedia(prefix, items) {
  return items.map((title, i) => ({
    id: `${prefix}-${i + 1}`,
    image: `https://picsum.photos/seed/${prefix}-${i + 1}/800/500`,
    title,
    date: '01/02/2026',
  }))
}

const GANG_MEDIA = {
  1: makeMedia('zm', [
    "Leader's Hideout Discovered",
    'Drug Shipment Intercepted',
    'Captured Arms Cache',
    'Rival Gang Clash',
    'Extortion Ring Busted',
    'Money Laundering Operation',
    'Border Crossing Surveillance',
    'Smuggling Route Identified',
    'Cartel Summit Intercepted',
  ]),
  2: makeMedia('sc', [
    'Pacific Route Seizure',
    'Tunnel Network Uncovered',
    'Fentanyl Lab Dismantled',
    'Cash Haul Confiscated',
    'Smuggling Fleet Grounded',
    'Cartel Safe House Raided',
    'Drug Mule Operation',
    'Corruption Investigation',
    'Money Transfer Intercepted',
  ]),
  3: makeMedia('ms', [
    'Gang Recruitment Drive',
    'Extortion Victim Rescued',
    'Tattoo Identification Evidence',
    'MS-13 Cell Dismantled',
    'Border Crossing Caught',
    'Human Smuggling Bust',
    'Weapons Cache Discovered',
    'Drive-By Evidence',
    'Informant Protection',
  ]),
  4: makeMedia('cc', [
    'Cartel Compound Raided',
    'Drug Lab Destroyed',
    'Money Laundering Probe',
    'Cali Network Exposed',
    'Arms Shipment Blocked',
    'Corruption Evidence',
    'Financial Records Seized',
    'Courier Arrested',
    'Surveillance Operation',
  ]),
  5: makeMedia('yk', [
    'Yakuza Meeting Surveilled',
    'Gambling Den Raided',
    'Construction Fraud Exposed',
    'Extortion Network Busted',
    'Port Infiltration Evidence',
    'Loan Shark Ring Dismantled',
    'Money Laundering Front Seized',
    'Human Trafficking Bust',
    'Arms Trade Intercepted',
  ]),
  6: makeMedia('cm', [
    'Camorra Clan Meeting',
    'Illegal Waste Dumping',
    'Construction Racket Exposed',
    'Drug Route Intercepted',
    'Extortion Evidence Seized',
    'Port Corruption Uncovered',
    'Money Network Dismantled',
    'Arms Cache Found',
    'Clan Leader Arrested',
  ]),
  7: makeMedia('nd', [
    "Ndrangheta's Summit Raided",
    'Money Laundering HQ Seized',
    'Drug Importation Bust',
    'Clan Leader Arrested',
    'Construction Fraud Probe',
    'Cocaine Shipment Seized',
    'Extortion Ring Dismantled',
    'Political Ties Exposed',
    'Arms Haul Confiscated',
  ]),
  8: makeMedia('tr', [
    'Triad Meeting Surveilled',
    'Gambling Operation Raided',
    'Counterfeit Ring Busted',
    'Smuggling Network Exposed',
    'Protection Racket Evidence',
    'Money Transfer Blocked',
    'Human Trafficking Bust',
    'Weapon Cache Discovered',
    'Drug Route Dismantled',
  ]),
  9: makeMedia('ab', [
    'Gang Recruitment Evidence',
    'White Supremacy Rally',
    'Arms Cache Uncovered',
    'Drug Network Busted',
    'Extortion Evidence',
    'Prison Gang Link Exposed',
    'Fraud Operation Raided',
    'Militia Training Footage',
    'Money Laundering Probe',
  ]),
  10: makeMedia('ha', [
    'Chapter Headquarters Raided',
    'Drug Trafficking Operation',
    'Weapons Shipment Seized',
    'Money Laundering Bust',
    'Gang Fight Evidence',
    'Club Compound Searched',
    'Extortion Evidence',
    'Arms Cache Discovered',
    'Undercover Surveillance',
  ]),
  11: makeMedia('bl', [
    'Gang Territory Dispute',
    'Drive-By Evidence',
    'Drug Corner Operation',
    'Arms Seizure',
    'Gang Initiation Evidence',
    'Surveillance Footage',
    'Drug Den Raided',
    'Gang Graffiti Documented',
    'Arrest Operation',
  ]),
  12: makeMedia('cr', [
    'Crips Territory Raid',
    'Drug Stash Discovered',
    'Gang Member Arrested',
    'Arms Cache Found',
    'Drive-By Investigation',
    'Drug Network Exposed',
    'Gang Summit Intercepted',
    'Surveillance Operation',
    'Money Laundering Bust',
  ]),
}

/* ── Sub-components ── */

function MediaCard({ image, title, date }) {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} className={styles.cardImage} loading="lazy" />
      <button
        type="button"
        className={styles.expandBtn}
        aria-label={`Expand: ${title}`}
      >
        <ExpandIcon />
      </button>
      <div className={styles.cardOverlay}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardDate}>{date}</span>
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function GangMediaTab({ gang }) {
  const [search, setSearch] = useState('')

  const allMedia = GANG_MEDIA[gang?.id] ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return allMedia
    const q = search.toLowerCase()
    return allMedia.filter(m => m.title.toLowerCase().includes(q))
  }, [allMedia, search])

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.heading}>Media Files</h3>
        <div className={styles.headerControls}>
          <div className={styles.searchWrap}>
            <SearchInput placeholder="Search Title" onSearch={setSearch} />
          </div>
          <div className={styles.dateRange}>
            <span className={styles.dateText}>01 Jan - 01 Feb, 26</span>
            <CalendarIcon />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>No media files match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <MediaCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Icons ── */

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
