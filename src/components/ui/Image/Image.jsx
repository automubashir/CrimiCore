/**
 * Drop-in replacement for next/image.
 * Accepts the same props (src, alt, width, height, fill, priority, style, className).
 * - priority  → sets loading="eager" instead of the default "lazy"
 * - fill      → makes the img cover its positioned parent (position:absolute + inset:0 + object-fit:cover)
 */
export default function Image({
  src,
  alt = '',
  width,
  height,
  fill,
  priority,
  style,
  className,
  ...rest
}) {
  const fillStyle = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
    : {}

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : 'lazy'}
      style={{ ...fillStyle, ...style }}
      className={className}
      {...rest}
    />
  )
}
