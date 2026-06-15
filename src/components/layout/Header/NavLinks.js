'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home',       href: '/' },
  { label: 'Activities', href: '/activities' },
  { label: 'Gangs',      href: '/gangs' },
  { label: 'Criminals',  href: '/criminals' },
  { label: 'Heatmap',    href: '/heatmap' },
  { label: 'Reports',    href: '/reports' },
  { label: 'Settings',   href: '/settings' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
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
