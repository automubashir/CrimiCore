'use client'
import { useState } from 'react'

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#091A29"/>
  <rect x="14" y="20" width="52" height="40" rx="3" fill="none" stroke="#12304D" stroke-width="1.5"/>
  <circle cx="26" cy="32" r="5" fill="none" stroke="#12304D" stroke-width="1.5"/>
  <path d="M14 52 L26 36 L38 48 L48 34 L66 60" fill="none" stroke="#12304D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="14" y1="14" x2="66" y2="66" stroke="#F2464A" stroke-width="2.5" stroke-linecap="round"/>
</svg>`

const FALLBACK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`

export default function SafeImage({ src, alt = '', className, width, height, style }) {
  const [errored, setErrored] = useState(false)
  return (
    <img
      src={errored || !src ? FALLBACK : src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={() => setErrored(true)}
    />
  )
}
