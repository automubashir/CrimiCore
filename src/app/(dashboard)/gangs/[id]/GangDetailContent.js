'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import Badge from '@/components/ui/Badge/Badge'
import GangTerritorialMap from '@/components/gangs/GangTerritorialMap/GangTerritorialMap'
import styles from './gang-detail.module.css'

const TABS = [
  { key: 'overview',      label: 'Overview' },
  { key: 'members',       label: 'Members' },
  { key: 'related-news',  label: 'Related News' },
  { key: 'territories',   label: 'Territories' },
  { key: 'media',         label: 'Media' },
]

export default function GangDetailContent({ gang }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <main className={styles.page}>
      {/* Back link */}
      <Link href="/gangs" className={styles.backLink}>
        <ChevronLeftIcon />
        Back to Gangs
      </Link>

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* ── Main ── */}
        <div className={styles.main}>
          {/* Profile card */}
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <img
                src={gang.image}
                alt={gang.name}
                className={styles.avatar}
                width={64}
                height={64}
              />
              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>{gang.name}</h1>
                <span className={styles.profileAlias}>{gang.fullAlias}</span>
                <span className={styles.profileType}>{gang.type}</span>
              </div>
              <div className={styles.profileActions}>
                <span className={styles.lastUpdated}>Last updated: {gang.lastUpdated}</span>
                <div className={styles.actionButtons}>
                  <button className={styles.actionBtn} type="button">
                    <ExportIcon /> Export
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} type="button">
                    <EditIcon /> Edit Gang
                  </button>
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Leader</span>
                <span className={styles.metaValue}>{gang.leader}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Founded</span>
                <span className={styles.metaValue}>{gang.founded}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Origin</span>
                <span className={styles.metaValue}>{gang.origin}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Active Regions</span>
                <span className={styles.metaValue}>{gang.activeRegionsCount}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Active Members</span>
                <span className={styles.metaValue}>{gang.activeMembers.toLocaleString()}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Threat Level</span>
                <Badge threat={gang.threat}>
                  {gang.threat.charAt(0).toUpperCase() + gang.threat.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsArea}>
            <div className={styles.tabsBar} role="tablist">
              {TABS.map(tab => (
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

            <div className={styles.tabContent} role="tabpanel">
              {activeTab === 'overview'     ? <OverviewTab gang={gang} /> :
               activeTab === 'members'      ? <MembersTab gang={gang} /> :
               <ComingSoonTab label={TABS.find(t => t.key === activeTab)?.label} />}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <ThreatOverviewCard gang={gang} />
          <KeyAliasesCard aliases={gang.aliases} />
          <TopLeadersCard leaders={gang.leaders} />
          <CrimesInvolvedCard crimes={gang.topCrimes} />
        </aside>
      </div>
    </main>
  )
}

/* ─────────────────── Tab components ─────────────────── */

function OverviewTab({ gang }) {
  return (
    <>
      {/* Top: overview + map */}
      <div className={styles.overviewTopGrid}>
        <div className={styles.overviewLeft}>
          <div>
            <p className={styles.overviewTitle}>Overview</p>
            <p className={styles.overviewText}>{gang.overview}</p>
          </div>
          <div className={styles.crimesSection}>
            <span className={styles.crimesSectionTitle}>Crimes Involved</span>
            <div className={styles.crimesTags}>
              {gang.crimesInvolved.map(c => (
                <span key={c} className={styles.crimeTag}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <GangTerritorialMap territories={gang.territories} />
      </div>

      {/* Bottom: trend + recent activities */}
      <div className={styles.overviewBottomGrid}>
        <ActivityTrendSection trendData={gang.trendData} />
        <RecentActivitiesSection gang={gang} />
      </div>
    </>
  )
}

function ActivityTrendSection({ trendData }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendHeader}>
        <span className={styles.trendTitle}>Activity Trend</span>
        <span className={styles.trendSubtitle}>Last 6 Months</span>
      </div>
      <div className={styles.chartWrap}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#12304D" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#7589A0', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#7589A0', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#05101B', border: '1px solid #12304D', borderRadius: 4 }}
                labelStyle={{ color: '#9AB1CC', fontSize: 11 }}
                itemStyle={{ fontSize: 11 }}
              />
              <Line type="monotone" dataKey="high"   stroke="#F2464A" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="medium" stroke="#F3921B" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="low"    stroke="#70EA8D" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', background: 'var(--bg-elevated)' }} />
        )}
      </div>
    </div>
  )
}

function RecentActivitiesSection({ gang }) {
  const activities = [
    { id: 1, title: `${gang.name} members arrested in major drug bust`, date: 'May 18, 2025', threat: 'high' },
    { id: 2, title: `Authorities seize assets linked to ${gang.name}`, date: 'May 14, 2025', threat: 'medium' },
    { id: 3, title: `New extortion ring tied to ${gang.name} dismantled`, date: 'May 10, 2025', threat: 'high' },
    { id: 4, title: `${gang.name} trafficking route intercepted`, date: 'May 05, 2025', threat: 'medium' },
  ]

  return (
    <div className={styles.recentCard}>
      <span className={styles.recentHeader}>Recent Activities</span>
      <div className={styles.recentList}>
        {activities.map(act => (
          <div key={act.id} className={styles.recentItem}>
            <span className={styles.recentItemTitle}>{act.title}</span>
            <div className={styles.recentItemMeta}>
              <Badge threat={act.threat}>
                {act.threat.charAt(0).toUpperCase() + act.threat.slice(1)}
              </Badge>
              <span className={styles.recentItemDate}>{act.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersTab({ gang }) {
  return (
    <div className={styles.membersGrid}>
      {gang.leaders.map(leader => (
        <div key={leader.id} className={styles.memberRow}>
          <img
            src={leader.image}
            alt={leader.name}
            className={styles.memberAvatar}
            width={40}
            height={40}
          />
          <div className={styles.memberInfo}>
            <span className={styles.memberName}>{leader.name}</span>
            <span className={styles.memberRole}>{leader.role}</span>
          </div>
          <Badge threat={leader.threat}>
            {leader.threat.charAt(0).toUpperCase() + leader.threat.slice(1)}
          </Badge>
        </div>
      ))}
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

/* ─────────────────── Sidebar cards ─────────────────── */

function ThreatOverviewCard({ gang }) {
  const score = gang.threatScore
  const max = 100
  const pct = score / max

  const bgColor = '#12304D'
  const fgColor =
    gang.threat === 'high'   ? '#F2464A' :
    gang.threat === 'medium' ? '#F3921B' : '#70EA8D'

  // Semicircle arc: viewBox 0 0 160 88, center 80 88, radius 72
  const cx = 80, cy = 88, r = 72
  const circumference = Math.PI * r // half circle
  const fillLen = pct * circumference
  const gapLen  = circumference - fillLen

  // Arc starts at left (180°) and goes clockwise to right (0°)
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Threat Overview</span>
      </div>
      <div className={styles.sideCardBody}>
        <div className={styles.gaugeWrap}>
          <div className={styles.gaugeSvgWrap}>
            <svg viewBox="0 0 160 88" width="160" height="88" style={{ overflow: 'visible' }}>
              {/* background track */}
              <path d={d} fill="none" stroke={bgColor} strokeWidth="12" strokeLinecap="round" />
              {/* filled arc */}
              <path
                d={d}
                fill="none"
                stroke={fgColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${fillLen} ${gapLen}`}
              />
            </svg>
            <div className={styles.gaugeScore}>
              <span className={styles.gaugeScoreNum}>{score}</span>
              <span className={styles.gaugeScoreLabel}>/ 100</span>
            </div>
          </div>
          <div className={styles.threatLabels}>
            <span className={styles.threatLabelLow}>Low</span>
            <span className={styles.threatLabelHigh}>High</span>
          </div>
          <p className={styles.threatDesc}>{gang.threatDescription}</p>
          <div className={styles.threatHighlights}>
            {gang.threatHighlights.map((h, i) => (
              <div key={i} className={styles.threatHighlight}>
                <span className={styles.highlightDot} />
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KeyAliasesCard({ aliases }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Key Aliases</span>
        <span className={styles.countBadge}>{aliases.length}</span>
      </div>
      <div className={styles.aliasesList}>
        {aliases.map(alias => (
          <span key={alias} className={styles.aliasTag}>{alias}</span>
        ))}
      </div>
    </div>
  )
}

function TopLeadersCard({ leaders }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Top Leaders</span>
        <span className={styles.countBadge}>{leaders.length}</span>
      </div>
      <div className={styles.leadersList}>
        {leaders.map(leader => (
          <div key={leader.id} className={styles.leaderRow}>
            <img
              src={leader.image}
              alt={leader.name}
              className={styles.leaderAvatar}
              width={32}
              height={32}
            />
            <div className={styles.leaderInfo}>
              <span className={styles.leaderName}>{leader.name}</span>
              <span className={styles.leaderRole}>{leader.role}</span>
            </div>
            <Badge threat={leader.threat}>
              {leader.threat.charAt(0).toUpperCase() + leader.threat.slice(1)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function CrimesInvolvedCard({ crimes }) {
  const maxCount = crimes[0]?.count ?? 1
  const visible = crimes.slice(0, 10)

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Crimes Involved</span>
        <span className={styles.countBadge}>Top {visible.length}</span>
      </div>
      <div className={styles.crimesRankedList}>
        {visible.map(crime => (
          <div key={crime.rank} className={styles.crimeRankRow}>
            <span className={styles.crimeRankNum}>{crime.rank}</span>
            <div className={styles.crimeRankInfo}>
              <span className={styles.crimeRankName}>{crime.name}</span>
              <div className={styles.crimeBarTrack}>
                <div
                  className={styles.crimeBarFill}
                  style={{ width: `${(crime.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className={styles.crimeRankCount}>{crime.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── Icons ─────────────────── */

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
