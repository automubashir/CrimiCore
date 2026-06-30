import styles from './CrimeTags.module.css'

export default function CrimeTags({ crimeTypes = [], onSelect }) {
  const tags = crimeTypes.slice(0, 12).map(d => d.crime_type).filter(Boolean)

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Crime Tags</h2>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          {tags.map(tag => (
            <button key={tag} className={styles.tag} type="button" onClick={() => onSelect?.(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
