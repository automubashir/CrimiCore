'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/session'

export default function AuthGuard({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getSession()) {
      window.location.replace('/login')
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null
  return children
}
