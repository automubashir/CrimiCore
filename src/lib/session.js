const KEY = 'cp_session'

export function createSession(token) {
  localStorage.setItem(KEY, token)
}

export function deleteSession() {
  localStorage.removeItem(KEY)
}

export function getSession() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY)
}
