'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import CriminalLocationsMap from '@/components/criminals/CriminalLocationsMap/CriminalLocationsMap'
import CrimesTab from '@/components/criminals/CrimesTab/CrimesTab'
import CriminalMediaTab from '@/components/criminals/CriminalMediaTab/CriminalMediaTab'
import RelatedNewsTab from '@/components/activities/RelatedNewsTab/RelatedNewsTab'
import LocationsMapTab from '@/components/activities/LocationsMapTab/LocationsMapTab'
import styles from './criminal-detail.module.css'

const TABS = [
  { key: 'overview',    label: 'Overview'   },
  { key: 'members',     label: 'Members'    },
  { key: 'crimes',      label: 'Crimes'     },
  { key: 'activities',  label: 'Activities' },
  { key: 'locations',   label: 'Locations'  },
  { key: 'media',       label: 'Media'      },
]

const TREND_PERIODS = ['This Month', 'Last 6 Months', 'Last Year']

export default function CriminalDetailContent({ criminal }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <main className={styles.page}>
      <Link href="/criminals" className={styles.backLink}>
        <ChevronLeftIcon />
        Back to Criminals Directory
      </Link>

      <div className={styles.layout}>
        {/* ── Main ── */}
        <div className={styles.main}>
          {/* Profile card */}
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <SafeImage
                src={criminal.image}
                alt={criminal.name}
                className={styles.avatar}
                width={64}
                height={64}
              />
              <div className={styles.profileInfo}>
                <div className={styles.profileNameRow}>
                  <h1 className={styles.profileName}>{criminal.name}</h1>
                  {criminal.threat && (
                    <Badge threat={criminal.threat}>
                      {criminal.threat.toUpperCase()} THREAT
                    </Badge>
                  )}
                </div>
                <span className={styles.profileGang}>{criminal.gangLabel}</span>
                <span className={styles.profileType}>{criminal.type}</span>
              </div>
              <div className={styles.profileActions}>
                <span className={styles.lastUpdated}>
                  <span className={styles.lastUpdatedDot}>•</span>
                  Last Updated: {criminal.lastUpdated}
                </span>
                <div className={styles.actionButtons}>
                  <button className={styles.actionBtn} type="button">
                    <StarIcon /> Add to Watchlist
                  </button>
                  <button className={styles.actionBtn} type="button">
                    <ExportIcon /> Export Profile
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnIcon}`} type="button" aria-label="More options">
                    <DotsIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue}>{criminal.status}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Risk Score</span>
                <span className={styles.metaValue}>{criminal.riskScore}/100</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Threat Level</span>
                {criminal.threat
                  ? <Badge threat={criminal.threat}>{criminal.threat.toUpperCase()} THREAT</Badge>
                  : <span className={styles.metaValue}>—</span>}
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Aliases</span>
                <span className={styles.metaValue}>{criminal.aliases.length}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Origin</span>
                <span className={styles.metaValue}>
                  {criminal.nationalityFlag} {criminal.origin}
                </span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Active Regions</span>
                <span className={styles.metaValue}>{criminal.activeRegionsCount}</span>
              </div>
              <span className={styles.metaDivider} aria-hidden="true" />
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Gangs Associated</span>
                <span className={styles.metaValue}>{criminal.gangsAssociated}</span>
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
              {activeTab === 'overview'   ? <OverviewTab criminal={criminal} /> :
               activeTab === 'members'    ? <MembersTab criminal={criminal} /> :
               activeTab === 'crimes'     ? <CrimesTab criminal={criminal} /> :
               activeTab === 'activities' ? <RelatedNewsTab height="52rem" /> :
               activeTab === 'locations'  ? <LocationsMapTab /> :
               activeTab === 'media'      ? <CriminalMediaTab criminal={criminal} /> :
               <ComingSoonTab label={TABS.find(t => t.key === activeTab)?.label} />}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <ThreatAssessmentCard criminal={criminal} />
          {criminal.aliases.length > 0 && <KeyAliasesCard aliases={criminal.aliases} />}
          {criminal.associates.length > 0 && <AssociatesCard associates={criminal.associates} count={criminal.associateCount} />}
          <RecentNewsCard news={criminal.recentNews} count={criminal.recentNewsCount} />
        </aside>
      </div>
    </main>
  )
}

/* ─────────────────── Overview Tab ─────────────────── */

function OverviewTab({ criminal }) {
  return (
    <>
      {/* Row 1: Biographical Info + Summary */}
      <div className={styles.overviewRow1}>
        <BiographicalCard criminal={criminal} />
        <SummaryCard criminal={criminal} />
      </div>

      {/* Row 2: Gangs Associated + Key Connections */}
      <div className={styles.overviewRow2}>
        <GangsAssociatedCard gangs={criminal.gangs} />
        <KeyConnectionsCard connections={criminal.keyConnections} count={criminal.keyConnectionCount} />
      </div>

      {/* Row 3: Activity Trends + Recent Activities */}
      <div className={styles.overviewRow3}>
        <ActivityTrendsCard trendData={criminal.trendData} />
        <RecentActivitiesCard news={criminal.recentNews} count={criminal.recentNewsCount} />
      </div>

      {/* Row 4: Known Locations + Media */}
      <div className={styles.overviewRow4}>
        <KnownLocationsCard locations={criminal.locations} />
        <MediaGridCard media={criminal.media} />
      </div>
    </>
  )
}

function BiographicalCard({ criminal }) {
  return (
    <div className={styles.bioCard}>
      <div className={styles.bioSection}>
        <span className={styles.sectionTitle}>Biographical Info</span>
        <div className={styles.bioTable}>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>Full Name</span>
            <span className={styles.bioValue}>{criminal.fullName}</span>
          </div>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>Gender</span>
            <span className={styles.bioValue}>{criminal.gender}</span>
          </div>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>Nationality</span>
            <span className={styles.bioValue}>
              {criminal.nationalityFlag} {criminal.nationality}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.bioStatusSection}>
        <span className={styles.sectionTitle}>Status</span>
        <div className={styles.bioTable}>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>Last Activity</span>
            <span className={styles.bioValue}>{criminal.lastActivity}</span>
          </div>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>Threat</span>
            {criminal.threat
              ? <Badge threat={criminal.threat}>{criminal.threat.toUpperCase()} THREAT</Badge>
              : <span className={styles.bioValue}>—</span>}
          </div>
          <div className={styles.bioRow}>
            <span className={styles.bioLabel}>INTERPOL</span>
            <span className={`${styles.interpolBadge} ${criminal.threat ? styles[`interpol_${criminal.threat}`] : ''}`}>
              {criminal.interpol}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ criminal }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summarySection}>
        <span className={styles.sectionTitle}>Summary</span>
        <p className={styles.summaryText}>{criminal.summary}</p>
      </div>
      <div className={styles.crimesSection}>
        <span className={styles.sectionTitle}>Crimes Involved</span>
        <div className={styles.crimesTags}>
          {criminal.crimesInvolved.map(c => (
            <span key={c} className={styles.crimeTag}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function GangsAssociatedCard({ gangs }) {
  return (
    <div className={styles.gangsCard}>
      <span className={styles.sectionTitle}>Gangs Associated</span>
      <div className={styles.gangsGrid}>
        {gangs.map(g => (
          <div key={g.id} className={styles.gangItem}>
            <SafeImage
              src={g.image}
              alt={g.name}
              className={styles.gangImage}
              width={80}
              height={80}
            />
            <span className={styles.gangName}>{g.name}</span>
            {g.threat
              ? <Badge threat={g.threat}>{g.threat.toUpperCase()} THREAT</Badge>
              : <span>—</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function KeyConnectionsCard({ connections, count }) {
  return (
    <div className={styles.connectionsCard}>
      <div className={styles.connectionsHeader}>
        <span className={styles.sectionTitle}>Associates &amp; Key Connections</span>
        <a href="#" className={styles.seeMoreLink}>See More <span className={styles.seeMoreCount}>{count}</span></a>
      </div>
      <div className={styles.connectionsList}>
        {connections.map(c => (
          <div key={c.id} className={styles.connectionItem}>
            <SafeImage
              src={c.image}
              alt={c.name}
              className={styles.connectionAvatar}
              width={80}
              height={80}
            />
            <span className={styles.connectionName}>{c.name}</span>
            {c.threat
              ? <Badge threat={c.threat}>{c.threat.toUpperCase()} THREAT</Badge>
              : <span>—</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityTrendsCard({ trendData }) {
  const [mounted, setMounted] = useState(false)
  const [activePeriod, setActivePeriod] = useState('Last 6 Months')
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendHeader}>
        <span className={styles.trendTitle}>Activity Trends</span>
        <div className={styles.trendPeriods}>
          {TREND_PERIODS.map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.periodBtn} ${activePeriod === p ? styles.periodActive : ''}`}
              onClick={() => setActivePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
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

function RecentActivitiesCard({ news, count }) {
  return (
    <div className={styles.recentCard}>
      <div className={styles.recentHeader}>
        <div className={styles.recentHeaderLeft}>
          <span className={styles.recentTitle}>Recent Activities</span>
          <span className={styles.recentCountBadge}>{count}</span>
        </div>
        <a href="#" className={styles.viewAllLink}>View All</a>
      </div>
      <div className={styles.recentList}>
        {news.slice(0, 3).map(item => (
          <div key={item.id} className={styles.recentItem}>
            <SafeImage
              src={item.image}
              alt={item.title}
              className={styles.recentItemImage}
              width={64}
              height={64}
            />
            <div className={styles.recentItemBody}>
              {item.category && (
                <Badge category={item.category} variant="sm">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Badge>
              )}
              <span className={styles.recentItemTitle}>{item.title}</span>
              <span className={styles.recentItemDesc}>{item.description}</span>
              <div className={styles.recentItemFooter}>
                <span className={styles.recentItemMeta}><CalendarIcon />{item.date}</span>
                <span className={styles.recentItemMeta}><PinIcon />{item.location}</span>
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

function KnownLocationsCard({ locations }) {
  return (
    <div className={styles.locationsCard}>
      <div className={styles.locationsHeader}>
        <span className={styles.sectionTitle}>Known Locations</span>
        <span className={styles.locationsSubtitle}>Places where the criminal activity records have been found.</span>
      </div>
      <CriminalLocationsMap locations={locations} />
    </div>
  )
}

function MediaGridCard({ media }) {
  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaHeader}>
        <span className={styles.sectionTitle}>Media</span>
        <a href="#" className={styles.viewAllLink}>View All</a>
      </div>
      <div className={styles.mediaGrid}>
        {media.map((src, i) => (
          <SafeImage
            key={i}
            src={src}
            alt={`Media ${i + 1}`}
            className={styles.mediaThumb}
            width={200}
            height={150}
          />
        ))}
      </div>
    </div>
  )
}


/* ─────────────────── Members tab ─────────────────── */

const LEADER_EXTRAS = [
  { status: 'Convicted', joinedSince: 2005 },
  { status: 'Active',    joinedSince: 2007 },
  { status: 'In-Trial',  joinedSince: 2009 },
  { status: 'Active',    joinedSince: 2011 },
  { status: 'Convicted', joinedSince: 2003 },
]

const MOCK_MEMBERS = [
  { id: 'mm-1', name: 'Alfonso Santillan-Sanchez',   image: null, role: 'Enforcer', status: 'Active',    threat: 'high',   joinedSince: 2015, crimes: ['Smuggling', 'Kidnapping', 'Arson'],        extraCrimes: 3 },
  { id: 'mm-2', name: 'Roudy Dorccilhomme',          image: null, role: 'Enforcer', status: 'Active',    threat: 'medium', joinedSince: 2018, crimes: ['Tax Evasion', 'Bribery', 'Fraud'],         extraCrimes: 3 },
  { id: 'mm-3', name: 'Carols Cardona',              image: null, role: 'Enforcer', status: 'Active',    threat: 'medium', joinedSince: 2010, crimes: ['Money Laundering', 'Armed Assault'],        extraCrimes: 3 },
  { id: 'mm-4', name: 'Carlos Alfredo Romero',       image: null, role: 'Member',   status: 'Arrested',  threat: 'high',   joinedSince: 2005, crimes: ['Drug Trafficking', 'Robbery'],             extraCrimes: 5 },
  { id: 'mm-5', name: 'Fernando Melendez-Ramirez',   image: null, role: 'Member',   status: 'In-Trial',  threat: 'high',   joinedSince: 2005, crimes: ['Drug Trafficking', 'Human Trafficking'],   extraCrimes: 5 },
  { id: 'mm-6', name: 'Diego Mejia-Canales',         image: null, role: 'Member',   status: 'Convicted', threat: 'medium', joinedSince: 2001, crimes: ['Arms Dealing', 'Racketeering'],            extraCrimes: 5 },
  { id: 'mm-7', name: 'Alex Ucles Cruz',             image: null, role: 'Member',   status: 'Convicted', threat: 'high',   joinedSince: 2005, crimes: ['Armed Robbery', 'Illegal Arms Trade'],     extraCrimes: 2 },
  { id: 'mm-8', name: 'Jonathan Jafet Lopez-Coronel',image: null, role: 'Member',   status: 'Convicted', threat: 'high',   joinedSince: 2005, crimes: ['Armed Robbery', 'Assault'],               extraCrimes: 2 },
  { id: 'mm-9', name: 'Dariusz Blaszczyk',           image: null, role: 'Member',   status: 'Active',    threat: 'medium', joinedSince: 2008, crimes: ['Extortion', 'Bribery', 'Counterfeiting'], extraCrimes: 2 },
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

function MembersTab({ criminal }) {
  const [search, setSearch] = useState('')

  const leaders = (criminal.gangs ?? []).slice(0, 3).map((g, i) => ({
    id:          `leader-${i}`,
    name:        g.name,
    image:       g.image,
    role:        'Leader',
    status:      LEADER_EXTRAS[i]?.status     ?? 'Active',
    joinedSince: LEADER_EXTRAS[i]?.joinedSince ?? 2010,
    threat:      g.threat ?? 'medium',
    crimes:      (criminal.crimesInvolved ?? []).slice(0, 3),
    extraCrimes: Math.max(0, (criminal.crimesInvolved ?? []).length - 3),
  }))

  const query           = search.toLowerCase()
  const filteredLeaders = leaders.filter(m => m.name.toLowerCase().includes(query))
  const filteredMembers = MOCK_MEMBERS.filter(m => m.name.toLowerCase().includes(query))

  return (
    <div className={styles.membersWrap}>
      <div className={styles.membersSearchBox}>
        <SearchInput placeholder="Search Members" onSearch={setSearch} />
      </div>

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

function ThreatAssessmentCard({ criminal }) {
  const score = criminal.threatScore
  const pct   = score / 100
  const fgColor =
    criminal.threat === 'high'   ? '#F2464A' :
    criminal.threat === 'medium' ? '#F3921B' :
    criminal.threat === 'low'    ? '#70EA8D' : '#12304D'

  const cx = 80, cy = 88, r = 72
  const circumference = Math.PI * r
  const fillLen = pct * circumference
  const gapLen  = circumference - fillLen
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Threat Assessment</span>
      </div>
      <div className={styles.sideCardBody}>
        {/* Gauge */}
        <div className={styles.gaugeWrap}>
          <div className={styles.gaugeSvgWrap}>
            <svg viewBox="0 0 160 88" width="160" height="88" style={{ overflow: 'visible' }}>
              <path d={d} fill="none" stroke="#12304D" strokeWidth="12" strokeLinecap="round" />
              <path d={d} fill="none" stroke={fgColor} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${fillLen} ${gapLen}`} />
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
          {criminal.threat && (
            <span className={styles.threatLevelPill} style={{ background: fgColor }}>
              {criminal.threat.toUpperCase()} THREAT
            </span>
          )}
        </div>

        {/* Per-crime scores */}
        <div className={styles.crimeScoresList}>
          {criminal.crimeScores.map(cs => {
            const barColor = cs.score >= 80 ? '#F2464A' : cs.score >= 60 ? '#F3921B' : '#70EA8D'
            return (
              <div key={cs.name} className={styles.crimeScoreRow}>
                <span className={styles.crimeScoreName}>{cs.name}</span>
                <div className={styles.crimeScoreBarWrap}>
                  <div
                    className={styles.crimeScoreBar}
                    style={{ width: `${cs.score}%`, background: barColor }}
                  />
                </div>
                <span className={styles.crimeScoreValue} style={{ color: barColor }}>
                  {cs.score}/100
                </span>
              </div>
            )
          })}
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

function AssociatesCard({ associates, count }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Associates</span>
        <div className={styles.sideCardHeaderRight}>
          <span className={styles.countBadge}>{count}</span>
          <a href="#" className={styles.viewAllSmall}>View All</a>
        </div>
      </div>
      <div className={styles.leadersList}>
        {associates.map(a => (
          <div key={a.id} className={styles.leaderRow}>
            <SafeImage
              src={a.image}
              alt={a.name}
              className={styles.leaderAvatar}
              width={32}
              height={32}
            />
            <div className={styles.leaderInfo}>
              <span className={styles.leaderName}>{a.name}</span>
              <span className={styles.leaderRole}>{a.role}</span>
            </div>
            {a.threat && (
              <Badge threat={a.threat}>
                {a.threat.charAt(0).toUpperCase() + a.threat.slice(1)}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentNewsCard({ news, count }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.sideCardTitle}>Recent News</span>
        <div className={styles.sideCardHeaderRight}>
          <span className={styles.countBadge}>{count}</span>
          <a href="#" className={styles.viewAllSmall}>View All</a>
        </div>
      </div>
      <div className={styles.newsList}>
        {news.map(item => (
          <div key={item.id} className={styles.newsItem}>
            <SafeImage
              src={item.image}
              alt={item.title}
              className={styles.newsThumb}
              width={80}
              height={60}
            />
            <div className={styles.newsBody}>
              {item.category && (
                <Badge category={item.category} variant="sm">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Badge>
              )}
              <span className={styles.newsTitle}>{item.title}</span>
              <span className={styles.newsDesc}>{item.description}</span>
            </div>
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

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
