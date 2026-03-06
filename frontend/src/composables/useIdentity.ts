import { ref } from 'vue'

interface Identity {
  id: string
  name: string
}

const STORAGE_KEY = 'retro-identity'
const identity = ref<Identity | null>(null)

const stored = localStorage.getItem(STORAGE_KEY)
if (stored) {
  identity.value = JSON.parse(stored)
}

export function useIdentity() {
  function save(name: string) {
    const newIdentity: Identity = { id: crypto.randomUUID(), name: name.trim() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdentity))
    identity.value = newIdentity
  }

  return { identity, save }
}
