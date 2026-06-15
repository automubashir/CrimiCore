import styles from './CrimeTags.module.css'

const TAGS = [
  'Armed Robbery',
  'Drug Trafficking',
  'Vehicle Theft',
  'Organized Crime',
  'Assault',
  'Fraud',
  'Robbery',
]

export default function CrimeTags() {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Crime Tags</h2>
      </div>
      <div className="section-card-content">
        <div className={styles.body}>
          {TAGS.map(tag => (
            <button key={tag} className={styles.tag} type="button">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
