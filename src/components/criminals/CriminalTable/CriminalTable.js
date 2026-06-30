import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge/Badge'
import SafeImage from '@/components/ui/SafeImage/SafeImage'
import { Bone } from '@/components/ui/Skeleton/Skeleton'
import styles from './CriminalTable.module.css'

export default function CriminalTable({ criminals, hasMore, loading = false, onSeeMore }) {
  return (
    <div className={styles.table}>
      <div className={styles.thead}>
        <span />
        <span className={styles.th}>Gang / Alias</span>
        <span className={styles.th}>Threat Level</span>
        <span className={styles.th}>Active Regions</span>
        <span className={styles.th}>Crimes</span>
        <span />
      </div>

      <div className={styles.tbody}>
        {criminals.length > 0 ? (
          criminals.map(c => <CriminalRow key={c.id} {...c} />)
        ) : (
          <div className={styles.empty}>No criminals match your search.</div>
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
function CriminalRow({ id, name, alias, gang, image, threat, activeRegions, regionCount, crimes, extraCount }) {
  return (
    <Link to={`/criminals/${encodeURIComponent(id)}`} className={styles.row}>
      <SafeImage src={image} alt={name} className={styles.avatar} width={48} height={48} />

      <div className={styles.nameCell}>
        <span className={styles.name}>{name}</span>
        <span className={styles.alias}>{gang}{alias ? ` · ${alias}` : ''}</span>
      </div>

      <div className={styles.threatCell}>
        {threat
          ? <Badge threat={threat}>{threat.toUpperCase()}</Badge>
          : <span>—</span>}
      </div>

      <div className={styles.regionCell}>
        <span className={styles.regions}>{activeRegions}</span>
        <span className={styles.regionCount}>{regionCount}</span>
      </div>

      <div className={styles.crimesCell}>
        {crimes.map(c => (
          <span key={c} className={styles.crimeTag}>{c}</span>
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
export function CriminalTableSkeleton({ rows = 6 }) {
  return (
    <div className={styles.table}>
      <div className={styles.thead}>
        <span />
        <span className={styles.th}>Gang / Alias</span>
        <span className={styles.th}>Threat Level</span>
        <span className={styles.th}>Active Regions</span>
        <span className={styles.th}>Crimes</span>
        <span />
      </div>
      <div className={styles.tbody}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.row}>
            <Bone width={48} height={48} style={{ borderRadius: 'var(--radius-md)' }} />
            <div className={styles.nameCell}>
              <Bone width="75%" height={14} />
              <Bone width="55%" height={11} style={{ marginTop: 4 }} />
            </div>
            <div className={styles.threatCell}><Bone width={64} height={22} /></div>
            <div className={styles.regionCell}>
              <Bone width="85%" height={13} />
              <Bone width="50%" height={11} style={{ marginTop: 4 }} />
            </div>
            <div className={styles.crimesCell}>
              <Bone width={70} height={20} />
              <Bone width={56} height={20} />
            </div>
            <span />
          </div>
        ))}
      </div>
    </div>
  )
}
