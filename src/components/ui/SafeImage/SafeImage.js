'use client'
import { useState } from 'react'
import fallbackHorizontal from '@/assets/images/ImgBrokenHorizonal.jpg'
import fallbackPortrait from '@/assets/images/ImgBrokenPortrait.jpg'

export default function SafeImage({ src, alt = '', className, width, height, style }) {
  const [fallback, setFallback] = useState(null)

  const handleError = (e) => {
    const el = e.currentTarget
    const w = el.clientWidth || Number(width) || 0
    const h = el.clientHeight || Number(height) || 0
    setFallback(h > w ? fallbackPortrait : fallbackHorizontal)
  }

  const resolved = fallback || (!src ? fallbackHorizontal : src)

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={fallback ? undefined : handleError}
    />
  )
}
