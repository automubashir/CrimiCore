'use server'

import { createSession } from '@/lib/session'

export async function login(username, password) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    if (!res.ok) {
      return { error: 'Invalid credentials. Please try again.' }
    }

    const data = await res.json()
    const token = data.access_token ?? data.token ?? data.jwt

    if (!token) {
      return { error: 'Authentication failed. Please try again.' }
    }

    await createSession(token)
    return { success: true }
  } catch {
    return { error: 'Unable to connect to the server. Please try again.' }
  }
}
