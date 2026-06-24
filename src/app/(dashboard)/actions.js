import { deleteSession } from '@/lib/session'

export function logout() {
  deleteSession()
  window.location.href = '/login'
}
