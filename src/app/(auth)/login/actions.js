'use server'

import { createSession } from '@/lib/session'

export async function login(username, password) {
  if (username === 'admin' && password === 'Hello@1122') {
    await createSession()
    return { success: true }
  }
  return { error: 'Invalid credentials. Please try again.' }
}
