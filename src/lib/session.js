import { cookies } from 'next/headers'

const SESSION_COOKIE = 'cp_session'
const SESSION_VALUE = 'authenticated'
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export async function createSession() {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
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
