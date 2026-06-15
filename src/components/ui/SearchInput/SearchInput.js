'use client'

import { useState } from 'react'
import styles from './SearchInput.module.css'

export default function SearchInput({ placeholder = 'Search...', onSearch }) {
  const [value, setValue] = useState('')

  return (
    <div className={styles.wrapper}>
      <svg className={styles.icon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className={styles.input}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSearch?.(e.target.value)
        }}
      />
    </div>
  )
}
