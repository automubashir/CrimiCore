/**
 * Local preview server for the Next.js static export (out/).
 * Run after `npm run build`:  node preview.mjs
 *
 * Routing logic:
 *  1. Exact file on disk  →  serve it directly
 *  2. Directory index     →  serve dir/index.html
 *  3. Known dynamic route →  serve the pre-built shell  (out/criminals/_/index.html, etc.)
 *  4. Anything else       →  serve out/index.html  (home shell as fallback)
 */

import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const OUT  = './out'
const PORT = 3000

// Map URL top-level segment → its pre-built dynamic shell
const SHELLS = {
  criminals:  join(OUT, 'criminals',  '_', 'index.html'),
  gangs:      join(OUT, 'gangs',      '_', 'index.html'),
  activities: join(OUT, 'activities', '_', 'index.html'),
}

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'text/javascript',
  '.css':   'text/css',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.mp4':   'video/mp4',
  '.webm':  'video/webm',
}

function isFile(p) {
  try { return statSync(p).isFile() } catch { return false }
}

function send(res, filePath) {
  const mime = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': mime })
  createReadStream(filePath).pipe(res)
}

createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://x').pathname
  const segments = urlPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean)

  // 1. Exact file
  const exact = join(OUT, urlPath)
  if (isFile(exact)) { send(res, exact); return }

  // 2. Directory index
  const idx = join(OUT, urlPath, 'index.html')
  if (isFile(idx)) { send(res, idx); return }

  // 3. Dynamic shell  —  /criminals/123 or /criminals/123/  →  criminals/_/index.html
  const top = segments[0] ?? ''
  if (segments.length >= 2 && SHELLS[top] && isFile(SHELLS[top])) {
    send(res, SHELLS[top]); return
  }

  // 4. Root fallback
  send(res, join(OUT, 'index.html'))
}).listen(PORT, () => {
  console.log(`Preview →  http://localhost:${PORT}`)
  console.log('(built from out/ — run npm run build first)')
})
