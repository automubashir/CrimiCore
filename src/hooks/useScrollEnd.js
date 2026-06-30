import { useEffect, useRef } from 'react'

// Fires `onVisible` when the returned ref element scrolls into the
// viewport (with a 200 px bottom buffer for a smooth pre-load feel).
// Re-subscribes only when `enabled` changes, keeping `onVisible` fresh
// via a mutable ref so callers can pass inline functions without worry.
export function useScrollEnd(onVisible, enabled = true) {
  const sentinelRef = useRef(null)
  const callbackRef = useRef(onVisible)
  callbackRef.current = onVisible

  useEffect(() => {
    if (!enabled) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callbackRef.current() },
      { rootMargin: '0px 0px 200px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return sentinelRef
}
