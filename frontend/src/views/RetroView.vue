<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRetroStore } from '../stores/retro'
import { useSocket } from '../composables/useSocket'
import { useIdentity } from '../composables/useIdentity'
import BoardColumn from '../components/BoardColumn.vue'

const route = useRoute()
const store = useRetroStore()
const socket = useSocket()
const { identity } = useIdentity()

const sessionId = route.params.id as string

watch(identity, (val) => {
  if (val) socket.connect(sessionId, val.id, val.name)
}, { immediate: true })

onUnmounted(() => socket.disconnect())

const copied = ref(false)

async function copyLink() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // Fallback for non-HTTPS contexts
    const el = document.createElement('textarea')
    el.value = url
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function handleAddCard(columnId: string, text: string) {
  if (!identity.value || !store.session) return
  socket.createCard({ sessionId, columnId, text, authorId: identity.value.id, authorName: identity.value.name })
}

function revealAll() {
  socket.revealAll({ sessionId })
}

function hideAll() {
  socket.hideAll({ sessionId })
}

const hasHidden = computed(() => store.session?.cards.some((c) => c.hidden) ?? false)
const hasVisible = computed(() => store.session?.cards.some((c) => !c.hidden) ?? false)

const onlineParticipants = computed(() =>
  store.session?.participants.filter((p) => p.online) ?? [],
)

const AVATAR_COLORS = [
  'bg-indigo-400', 'bg-rose-400', 'bg-amber-400',
  'bg-green-400', 'bg-purple-400', 'bg-cyan-400',
]

function avatarColor(id: string): string {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
      <span class="font-bold text-gray-800 text-lg">360retro</span>
      <span class="text-gray-300">|</span>
      <span class="text-gray-600 font-medium truncate">{{ store.session?.name ?? sessionId }}</span>

      <div class="ml-auto flex items-center gap-3">
        <!-- Participants -->
        <div v-if="onlineParticipants.length > 1" class="flex items-center -space-x-1">
          <div
            v-for="p in onlineParticipants"
            :key="p.id"
            :title="p.name"
            class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white"
            :class="avatarColor(p.id)"
          >
            {{ p.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Reveal / Hide all -->
        <button
          v-if="hasHidden"
          class="text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 py-1.5 transition-colors"
          @click="revealAll"
        >
          Reveal all
        </button>
        <button
          v-if="hasVisible"
          class="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          @click="hideAll"
        >
          Hide all
        </button>

        <button
          class="text-sm border rounded-lg px-3 py-1.5 transition-colors"
          :class="copied
            ? 'text-green-600 border-green-200 bg-green-50'
            : 'text-gray-500 hover:text-gray-700 border-gray-200'"
          @click="copyLink"
        >
          {{ copied ? 'Copied!' : 'Copy link' }}
        </button>

        <span v-if="identity" class="text-sm font-medium text-gray-700">{{ identity.name }}</span>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="!store.session" class="flex-1 flex items-center justify-center">
      <p class="text-gray-400">Connecting to session…</p>
    </div>

    <!-- Board -->
    <main v-else class="flex-1 flex gap-4 p-6 overflow-x-auto">
      <BoardColumn
        v-for="column in store.session.columns"
        :key="column.id"
        :column="column"
        :cards="store.cardsByColumn[column.id] ?? []"
        :groups="store.groupsByColumn[column.id] ?? []"
        :session-id="sessionId"
        @add-card="(text) => handleAddCard(column.id, text)"
      />
    </main>
  </div>
</template>
