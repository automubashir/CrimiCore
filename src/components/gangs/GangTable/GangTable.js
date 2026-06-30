import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge/Badge'
import { Bone } from '@/components/ui/Skeleton/Skeleton'
import styles from './GangTable.module.css'

export default function GangTable({ gangs, hasMore, loading = false, onSeeMore }) {
  return (
    <div className={styles.table}>
      <div className={styles.thead}>
        <span className={styles.th}>Gang / Alias</span>
        <span className={styles.th}>Active Regions</span>
        <span className={styles.th}>Members</span>
        <span className={styles.th}>Threat Level</span>
        <span className={styles.th}>Primary Activities</span>
        <span />
      </div>

      <div className={styles.tbody}>
        {gangs.length > 0 ? (
          gangs.map(gang => <GangRow key={gang.id} {...gang} />)
        ) : (
          <div className={styles.empty}>No gangs match your search.</div>
        )}
      </div>

      {hasMore && (
        <div className={styles.seeMoreBar}>
          <button className={styles.seeMoreBtn} type="button" onClick={onSeeMore} disabled={loading}>
            {loading ? 'Loading…' : 'See More'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Individual row ── */
function GangRow({ id, name, alias, activeRegions, members, threat, primaryActivities, extraCount }) {
  return (
    <Link to={`/gangs/${encodeURIComponent(id)}`} className={styles.row}>
      <div className={styles.nameCell}>
        <span className={styles.name}>{name}</span>
        {alias && <span className={styles.alias}>({alias})</span>}
      </div>

      <div className={styles.regionCell}>
        <span className={styles.regions}>{activeRegions}</span>
      </div>

      <div className={styles.membersCell}>
        <MembersIcon />
        <div className={styles.membersText}>
          <span className={styles.membersCount}>{members.toLocaleString()}</span>
          <span className={styles.membersLabel}>Active Members</span>
        </div>
      </div>

      <div className={styles.threatCell}>
        {threat
          ? <Badge threat={threat}>{threat.toUpperCase()}</Badge>
          : <span>—</span>}
      </div>

      <div className={styles.activitiesCell}>
        {(primaryActivities ?? []).map(act => (
          <span key={act} className={styles.actTag}>{act}</span>
        ))}
        {extraCount > 0 && (
          <span className={styles.overflowTag}>+{extraCount}</span>
        )}
      </div>

      <span className={styles.arrowIcon} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </Link>
  )
}

/* ── Skeleton — reuses the real grid/cell classes so it matches the table exactly ── */
export function GangTableSkeleton({ rows = 6 }) {
  return (
    <div className={styles.table}>
      <div className={styles.thead}>
        <span className={styles.th}>Gang / Alias</span>
        <span className={styles.th}>Active Regions</span>
        <span className={styles.th}>Members</span>
        <span className={styles.th}>Threat Level</span>
        <span className={styles.th}>Primary Activities</span>
        <span />
      </div>
      <div className={styles.tbody}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.nameCell}><Bone width="80%" height={14} /></div>
            <div className={styles.regionCell}>
              <Bone width="70%" height={13} />
            </div>
            <div className={styles.membersCell}>
              <Bone width={16} height={16} />
              <Bone width={60} height={26} />
            </div>
            <div className={styles.threatCell}><Bone width={64} height={22} /></div>
            <div className={styles.activitiesCell}>
              <Bone width={70} height={20} />
              <Bone width={90} height={20} />
            </div>
            <span />
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersIcon() {
  return (
    <svg className={styles.membersIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
