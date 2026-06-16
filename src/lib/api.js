import { cookies } from 'next/headers'

const BASE_URL = process.env.API_BASE_URL

async function getToken() {
  const store = await cookies()
  return store.get('cp_session')?.value ?? null
}

export async function apiFetch(path, { auth = true, ...init } = {}) {
  const token = auth ? await getToken() : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text)
  }

  return res.json()
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function isNotFound(err) {
  return err instanceof ApiError && err.status === 404
}

export function buildQuery(params) {
  const qs = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return qs ? `?${qs}` : ''
}
