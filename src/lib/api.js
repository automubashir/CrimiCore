const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cp_session')
}

export async function apiFetch(path, { auth = true, ...init } = {}) {
  const token = auth ? getToken() : null

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.replace('/login')
    }
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
