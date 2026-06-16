import Link from 'next/link'
import Badge from '@/components/ui/Badge/Badge'
import styles from './GangTable.module.css'

/* ── Column headers ── */
export default function GangTable({ gangs, hasMore, onSeeMore }) {
  return (
    <div className={styles.table}>
      <div className={styles.thead}>
        <span />
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
          <button
            className={styles.seeMoreBtn}
            type="button"
            onClick={onSeeMore}
          >
            See More
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Individual row ── */
function GangRow({ id, name, alias, image, activeRegions, regionCount, members, threat, primaryActivities, extraCount }) {
  return (
    <Link href={`/gangs/${id}`} className={styles.row}>
      <img src={image} alt={name} className={styles.avatar} width={48} height={48} />

      <div className={styles.nameCell}>
        <span className={styles.name}>{name}</span>
        {alias && <span className={styles.alias}>({alias})</span>}
      </div>

      <div className={styles.regionCell}>
        <span className={styles.regions}>{activeRegions}</span>
        <span className={styles.regionCount}>{regionCount}</span>
      </div>

      <div className={styles.membersCell}>
        <MembersIcon />
        <div className={styles.membersText}>
          <span className={styles.membersCount}>{members.toLocaleString()}</span>
          <span className={styles.membersLabel}>Active Members</span>
        </div>
      </div>

      <div className={styles.threatCell}>
        <Badge threat={threat}>{threat.toUpperCase()}</Badge>
      </div>

      <div className={styles.activitiesCell}>
        {primaryActivities.map(act => (
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
