import styles from './PageShell.module.css'

export default function PageShell({ title, subtitle, children }) {
  return (
    <main className={styles.shell}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children ?? (
        <div className={styles.placeholder}>
          <div className={styles.placeholderInner}>
            <svg
              className={styles.placeholderIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span className={styles.placeholderText}>Content coming soon</span>
          </div>
        </div>
      )}
    </main>
  )
}
