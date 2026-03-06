<script setup lang="ts">
import { computed } from 'vue'
import { useRetroStore } from '../stores/retro'
import { useIdentity } from '../composables/useIdentity'
import { useSocket } from '../composables/useSocket'

const props = defineProps<{ cardId: string; sessionId: string }>()

const store = useRetroStore()
const { identity } = useIdentity()
const socket = useSocket()

const card = computed(() => store.session?.cards.find((c) => c.id === props.cardId))
const votes = computed(() => card.value?.votes ?? [])
const hasVoted = computed(() =>
  identity.value ? votes.value.includes(identity.value.id) : false,
)

const votesUsed = computed(() => {
  if (!identity.value || !store.session) return 0
  return store.session.cards.reduce(
    (n, c) => n + (c.votes.includes(identity.value!.id) ? 1 : 0), 0,
  )
})
const voteLimit = computed(() => store.session?.voteLimit ?? 3)
const limitReached = computed(() => votesUsed.value >= voteLimit.value)

const isOwn = computed(() => identity.value?.id === card.value?.authorId)
const disabled = computed(() =>
  (!isOwn.value && (card.value?.hidden ?? false)) ||
  (!hasVoted.value && limitReached.value),
)

function toggle() {
  if (!identity.value || disabled.value) return
  socket.voteCard({
    sessionId: props.sessionId,
    cardId: props.cardId,
    participantId: identity.value.id,
  })
}
</script>

<template>
  <button
    :disabled="disabled"
    class="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 transition-colors"
    :class="hasVoted
      ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
      : 'text-gray-400 hover:text-rose-400 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none'"
    @click.stop="toggle"
  >
    <span>{{ hasVoted ? '♥' : '♡' }}</span>
    <span v-if="votes.length > 0">{{ votes.length }}</span>
  </button>
</template>
