import { ref } from 'vue'

interface PendingGroup {
  cardId: string
  columnId: string
}

// Module-level so all components share the same grouping state
const pending = ref<PendingGroup | null>(null)

export function useGrouping() {
  function start(cardId: string, columnId: string) {
    pending.value = { cardId, columnId }
  }

  function cancel() {
    pending.value = null
  }

  return { pending, start, cancel }
}
