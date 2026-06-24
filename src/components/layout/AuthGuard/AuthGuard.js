'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/session'

export default function AuthGuard({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (getSession()) {
      setReady(true)
    } else {
      window.location.replace('/login')
    }
  }, [])

  if (!ready) return null
  return children
}
