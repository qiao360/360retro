import { Session } from 'shared/types'

interface StorageAdapter {
  getSession(id: string): Session | undefined
  saveSession(session: Session): void
}

class MemoryStorage implements StorageAdapter {
  private sessions = new Map<string, Session>()

  getSession(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  saveSession(session: Session): void {
    this.sessions.set(session.id, session)
  }
}

export const storage = new MemoryStorage()
