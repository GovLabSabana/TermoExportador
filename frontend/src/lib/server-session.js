import { getAuthSession } from '@/lib/server-auth'

export async function getServerSession() {
  try {
    return await getAuthSession()
  } catch (error) {
    console.error('Server session error:', error)
    return null
  }
}