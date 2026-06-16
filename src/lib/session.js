import { cookies } from 'next/headers'

const SESSION_COOKIE = 'cp_session'
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export async function createSession(token) {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession() {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}
