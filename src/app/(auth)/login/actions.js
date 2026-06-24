import { createSession } from '@/lib/session'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function login(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      return { error: 'Invalid credentials. Please try again.' }
    }

    const data = await res.json()
    const token = data.access_token ?? data.token ?? data.jwt

    if (!token) {
      return { error: 'Authentication failed. Please try again.' }
    }

    createSession(token)
    return { success: true }
  } catch {
    return { error: 'Unable to connect to the server. Please try again.' }
  }
}
