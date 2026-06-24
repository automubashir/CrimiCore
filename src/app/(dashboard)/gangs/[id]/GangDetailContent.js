'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import GangTerritorialMap from '@/components/gangs/GangTerritorialMap/GangTerritorialMap'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import RelatedNewsTab from '@/components/activities/RelatedNewsTab/RelatedNewsTab'
import LocationsMapTab from '@/components/activities/LocationsMapTab/LocationsMapTab'
import GangMediaTab from '@/components/gangs/GangMediaTab/GangMediaTab'
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
              <SafeImage
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
                {gang.threat ? (
                  <Badge threat={gang.threat}>
                    {gang.threat.charAt(0).toUpperCase() + gang.threat.slice(1)}
                  </Badge>
                ) : <span className={styles.metaValue}>—</span>}
              </div>
            </div>
          </div>

          {/* Tabs */}
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
          <div className={styles.tabsArea}>
            <div className={styles.tabContent} role="tabpanel">
              {activeTab === 'overview'      ? <OverviewTab gang={gang} /> :
               activeTab === 'members'       ? <MembersTab gang={gang} /> :
               activeTab === 'related-news'  ? <RelatedNewsTab height="52rem" /> :
               activeTab === 'territories'   ? <LocationsMapTab /> :
               activeTab === 'media'         ? <GangMediaTab gang={gang} /> :
               <ComingSoonTab label={TABS.find(t => t.key === activeTab)?.label} />}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <ThreatOverviewCard gang={gang} />
          {gang.aliases.length > 0 && <KeyAliasesCard aliases={gang.aliases} />}
          {gang.leaders.length > 0 && <TopLeadersCard leaders={gang.leaders} />}
          {gang.topCrimes.length > 0 && <CrimesInvolvedCard crimes={gang.topCrimes} />}
        </aside>
      </div>
    </main>
  )
}

/* ─────────────────── Tab components ─────────────────── */

function OverviewTab({ gang }) {
  return (
    <>
      {/* Top: left info + territorial map */}
      <div className={styles.overviewTopGrid}>
        <div className={styles.overviewLeft}>
          <div className={styles.overviewSection}>
            <p className={styles.overviewSectionTitle}>Overview</p>
            <p className={styles.overviewText}>{gang.overview}</p>
          </div>

          <div className={styles.crimesSection}>
            <span className={styles.overviewSectionTitle}>Crimes Involved</span>
            <div className={styles.crimesTags}>
              {gang.crimesInvolved.map(c => (
                <span key={c} className={styles.crimeTag}>{c}</span>
              ))}
            </div>
          </div>

          <div className={styles.summarySection}>
            <p className={styles.overviewSectionTitle}>Summary</p>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabelRow}>
                <span className={styles.summaryLabel}>Status</span>
                <Badge threat="low" variant="sm">Active</Badge>
              </div>
              <p className={styles.summaryText}>
                {gang.name} is still active, and operating in major South American regions,
                including {gang.origin}, Central America and United States.
              </p>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabelRow}>
                <span className={styles.summaryLabel}>Violence Index</span>
                {gang.threat ? (
                  <Badge threat={gang.threat} variant="sm">
                    {gang.threat.charAt(0).toUpperCase() + gang.threat.slice(1)}
                  </Badge>
                ) : <span>—</span>}
              </div>
              <p className={styles.summaryText}>{gang.threatDescription}</p>
            </div>
          </div>
        </div>

        {/* Right: Territorial Presence card */}
        <div className={styles.territorialCard}>
          <div className={styles.territorialCardHeader}>
            <span className={styles.territorialCardTitle}>Territorial Presence</span>
            <span className={styles.territorialCardSubtitle}>Detailed heatmap to showcase gang's presence</span>
          </div>
          <GangTerritorialMap territories={gang.territories} />
        </div>
      </div>

      {/* Bottom: trend + recent activities */}
      <div className={styles.overviewBottomGrid}>
        <ActivityTrendSection trendData={gang.trendData} />
        <RecentActivitiesSection recentNews={gang.recentNews} />
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
        <span className={styles.trendBadge}>15</span>
      </div>
      <div className={styles.chartWrap}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#0F2D48" strokeDasharray="" vertical={true} />
              <XAxis dataKey="date" tick={{ fill: '#7589A0', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#7589A0', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#05101B', border: '1px solid #12304D', borderRadius: 4 }}
                labelStyle={{ color: '#9AB1CC', fontSize: 11 }}
                itemStyle={{ fontSize: 11 }}
              />
              <Line type="monotone" dataKey="high"
                stroke="#F2464A" strokeWidth={2}
                dot={{ r: 3, fill: '#F2464A', stroke: '#F2464A', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#F2464A', stroke: '#05101B', strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="medium"
                stroke="#F3921B" strokeWidth={2}
                dot={{ r: 3, fill: '#F3921B', stroke: '#F3921B', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#F3921B', stroke: '#05101B', strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="low"
                stroke="#70EA8D" strokeWidth={2}
                dot={{ r: 3, fill: '#70EA8D', stroke: '#70EA8D', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#70EA8D', stroke: '#05101B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', background: 'var(--bg-elevated)' }} />
        )}
      </div>
      <div className={styles.trendLegend}>
        <span className={styles.trendLegendItem}><span className={`${styles.legendDot} ${styles.dotHigh}`} />High Threat</span>
        <span className={styles.trendLegendItem}><span className={`${styles.legendDot} ${styles.dotMedium}`} />Medium Threat</span>
        <span className={styles.trendLegendItem}><span className={`${styles.legendDot} ${styles.dotLow}`} />Low Threat</span>
      </div>
    </div>
  )
}

function RecentActivitiesSection({ recentNews = [] }) {
  return (
    <div className={styles.recentCard}>
      <div className={styles.recentHeader}>
        <div className={styles.recentHeaderLeft}>
          <span className={styles.recentTitle}>Recent Activities</span>
          <span className={styles.recentCountBadge}>{recentNews.length}</span>
        </div>
        <Link href="/activities" className={styles.viewAllLink}>View All</Link>
      </div>
      <div className={styles.recentList}>
        {recentNews.map(act => (
          <div key={act.id} className={styles.recentItem}>
            <SafeImage
              src={act.image}
              alt={act.title}
              className={styles.recentItemImage}
              width={64}
              height={64}
            />
            <div className={styles.recentItemBody}>
              <Badge category={act.category} variant="sm">
                {act.category.charAt(0).toUpperCase() + act.category.slice(1)}
              </Badge>
              <span className={styles.recentItemTitle}>{act.title}</span>
              <span className={styles.recentItemDesc}>{act.description}</span>
              <div className={styles.recentItemFooter}>
                <span className={styles.recentItemMeta}>
                  <CalendarIcon />
                  {act.date}
                </span>
                <span className={styles.recentItemMeta}>
                  <PinIcon />
                  {act.location}
                </span>
              </div>
            </div>
            <button className={styles.recentItemArrow} type="button" aria-label="View activity">
              <ArrowRightIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────── Members mock data ─────── */

const LEADER_EXTRAS = [
  { status: 'Convicted', joinedSince: 2005 },
  { status: 'Active',    joinedSince: 2007 },
  { status: 'In-Trial',  joinedSince: 2009 },
  { status: 'Active',    joinedSince: 2011 },
  { status: 'Convicted', joinedSince: 2003 },
]

const MOCK_MEMBERS = [
  { id: 'mm-1', name: 'Alfonso Santillan-Sanchez',   image: null,  role: 'Enforcer', status: 'Active',    threat: 'high',   joinedSince: 2015, crimes: ['Smuggling', 'Kidnapping', 'Arson'],           extraCrimes: 3 },
  { id: 'mm-2', name: 'Roudy Dorccilhomme',          image: null,  role: 'Enforcer', status: 'Active',    threat: 'medium', joinedSince: 2018, crimes: ['Tax Evasion', 'Bribery', 'Fraud'],            extraCrimes: 3 },
  { id: 'mm-3', name: 'Carols Cardona',               image: null,  role: 'Enforcer', status: 'Active',    threat: 'medium', joinedSince: 2010, crimes: ['Money Laundering', 'Armed Assault'],           extraCrimes: 3 },
  { id: 'mm-4', name: 'Carlos Alfredo Romero',        image: null,  role: 'Member',   status: 'Arrested',  threat: 'high',   joinedSince: 2005, crimes: ['Drug Trafficking', 'Robbery'],                extraCrimes: 5 },
  { id: 'mm-5', name: 'Fernando Melendez-Ramirez',    image: null,  role: 'Member',   status: 'In-Trial',  threat: 'high',   joinedSince: 2005, crimes: ['Drug Trafficking', 'Human Trafficking'],      extraCrimes: 5 },
  { id: 'mm-6', name: 'Diego Mejia-Canales',          image: null,  role: 'Member',   status: 'Convicted', threat: 'medium', joinedSince: 2001, crimes: ['Arms Dealing', 'Racketeering'],               extraCrimes: 5 },
  { id: 'mm-7', name: 'Alex Ucles Cruz',              image: null,  role: 'Member',   status: 'Convicted', threat: 'high',   joinedSince: 2005, crimes: ['Armed Robbery', 'Illegal Arms Trade'],        extraCrimes: 2 },
  { id: 'mm-8', name: 'Jonathan Jafet Lopez-Coronel', image: null,  role: 'Member',   status: 'Convicted', threat: 'high',   joinedSince: 2005, crimes: ['Armed Robbery', 'Assault'],                  extraCrimes: 2 },
  { id: 'mm-9', name: 'Dariusz Blaszczyk',            image: null,  role: 'Member',   status: 'Active',    threat: 'medium', joinedSince: 2008, crimes: ['Extortion', 'Bribery', 'Counterfeiting'],    extraCrimes: 2 },
]

const ROLE_CLASS = {
  'Leader':          'roleLeader',
  'Co-Leader':       'roleLeader',
  'Regional Leader': 'roleLeader',
  'Former Leader':   'roleLeader',
  'Enforcer':        'roleEnforcer',
  'Member':          'roleMember',
}

const STATUS_CLASS = {
  'Active':    'statusActive',
  'Convicted': 'statusConvicted',
  'In-Trial':  'statusInTrial',
  'Arrested':  'statusArrested',
}

function MemberCard({ member }) {
  return (
    <div className={styles.memberCard}>
      <div className={styles.memberCardTop}>
        <SafeImage
          src={member.image}
          alt={member.name}
          className={styles.memberCardAvatar}
          width={72}
          height={72}
        />
        <div className={styles.memberCardInfo}>
          <span className={styles.memberCardName}>{member.name}</span>
          <div className={styles.memberCardBadges}>
            <span className={`${styles.memberRoleBadge} ${styles[ROLE_CLASS[member.role] ?? 'roleLeader']}`}>
              {member.role}
            </span>
            <span className={`${styles.memberStatusBadge} ${styles[STATUS_CLASS[member.status] ?? 'statusActive']}`}>
              {member.status}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.memberCardDivider} />

      <div className={styles.memberCardBottom}>
        <div className={styles.memberCardMeta}>
          <span className={member.threat === 'high' ? styles.threatSolidHigh : styles.threatSolidMedium}>
            {member.threat === 'high' ? 'HIGH THREAT' : 'MEDIUM THREAT'}
          </span>
          <span className={styles.memberCardJoined}>Joined Since: {member.joinedSince}</span>
        </div>
        <span className={styles.memberCardCrimesLabel}>Crimes Involved</span>
        <div className={styles.memberCardCrimesList}>
          {member.crimes.map(c => (
            <span key={c} className={styles.memberCardCrimeTag}>{c}</span>
          ))}
          {member.extraCrimes > 0 && (
            <span className={styles.memberCardExtraTag}>+{member.extraCrimes}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MembersTab({ gang }) {
  const [search, setSearch] = useState('')

  const leaders = gang.leaders.slice(0, 3).map((l, i) => ({
    ...l,
    status: LEADER_EXTRAS[i].status,
    joinedSince: LEADER_EXTRAS[i].joinedSince,
    crimes: (gang.crimesInvolved ?? []).slice(0, 3),
    extraCrimes: Math.max(0, (gang.crimesInvolved ?? []).length - 3),
  }))

  const query = search.toLowerCase()
  const filteredLeaders  = leaders.filter(m => m.name.toLowerCase().includes(query))
  const filteredMembers  = MOCK_MEMBERS.filter(m => m.name.toLowerCase().includes(query))

  return (
    <div className={styles.membersWrap}>
      {/* Search */}
      <div className={styles.membersSearchBox}>
        <SearchInput placeholder="Search Members" onSearch={setSearch} />
      </div>

      {/* Leaders */}
      {filteredLeaders.length > 0 && (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionHead}>
            <span className={styles.membersSectionTitle}>Leaders</span>
            <span className={styles.membersSectionBadge}>{filteredLeaders.length}</span>
          </div>
          <div className={styles.membersCardGrid}>
            {filteredLeaders.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        </div>
      )}

      {/* All Members */}
      {filteredMembers.length > 0 && (
        <div className={styles.membersSection}>
          <div className={styles.membersSectionHead}>
            <span className={styles.membersSectionTitle}>All Members</span>
            <span className={styles.membersSectionBadge}>{MOCK_MEMBERS.length}</span>
          </div>
          <div className={styles.membersCardGrid}>
            {filteredMembers.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
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

/* ─────────────────── Sidebar cards ─────────────────── */

function ThreatOverviewCard({ gang }) {
  const score = gang.threatScore
  const max = 100
  const pct = score / max

  const bgColor = '#12304D'
  const fgColor =
    gang.threat === 'high'   ? '#F2464A' :
    gang.threat === 'medium' ? '#F3921B' :
    gang.threat === 'low'    ? '#70EA8D' : '#12304D'

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
            <SafeImage
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
            {leader.threat && (
              <Badge threat={leader.threat}>
                {leader.threat.charAt(0).toUpperCase() + leader.threat.slice(1)}
              </Badge>
            )}
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

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
