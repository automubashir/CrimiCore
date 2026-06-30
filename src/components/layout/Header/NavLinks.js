'use client'

import { Link, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home',       href: '/' },
  { label: 'Activities', href: '/activities' },
  { label: 'Gangs',      href: '/gangs' },
  { label: 'Criminals',  href: '/criminals' },
  { label: 'Heatmap',    href: '/heatmap' },
]

export default function NavLinks() {
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            to={href}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
