import styles from './Badge.module.css'

export default function Badge({ children, category, threat, variant }) {
  const cls = [styles.badge, variant && styles[variant]].filter(Boolean).join(' ')
  return (
    <span
      className={cls}
      data-cat={category}
      data-threat={threat}
    >
      {children}
    </span>
  )
}
