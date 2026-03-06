<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Card } from 'shared/types'
import { useIdentity } from '../composables/useIdentity'
import { useSocket } from '../composables/useSocket'
import { useGrouping } from '../composables/useGrouping'

const props = defineProps<{ card: Card; sessionId: string }>()

const { identity } = useIdentity()
const socket = useSocket()
const { pending, start, cancel } = useGrouping()

const isOwn = computed(() => identity.value?.id === props.card.authorId)
const isVisible = computed(() => isOwn.value || !props.card.hidden)

// Grouping mode
const isGroupSource = computed(() => pending.value?.cardId === props.card.id)
const isGroupTarget = computed(
  () => pending.value !== null
    && pending.value.cardId !== props.card.id
    && pending.value.columnId === props.card.columnId,
)

function handleCardClick() {
  if (isGroupSource.value) { cancel(); return }
  if (isGroupTarget.value) {
    socket.createGroup({
      sessionId: props.sessionId,
      columnId: props.card.columnId,
      cardIds: [pending.value!.cardId, props.card.id],
    })
    cancel()
  }
}

// Edit state
const editing = ref(false)
const editText = ref('')
const editTextarea = ref<HTMLTextAreaElement | null>(null)

async function startEdit() {
  editText.value = props.card.text
  editing.value = true
  await new Promise((r) => setTimeout(r, 0))
  editTextarea.value?.focus()
  editTextarea.value?.select()
}

function submitEdit() {
  const text = editText.value.trim()
  if (!text || text === props.card.text) return cancelEdit()
  socket.updateCard({ sessionId: props.sessionId, cardId: props.card.id, text })
  editing.value = false
}

function cancelEdit() { editing.value = false }

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit() }
  if (e.key === 'Escape') cancelEdit()
}

// Menu
const menuOpen = ref(false)
function toggleMenu() { menuOpen.value = !menuOpen.value }
function closeMenu() { menuOpen.value = false }
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border p-3 flex flex-col gap-2 group relative transition-colors"
    :class="{
      'border-indigo-400 ring-2 ring-indigo-300 cursor-pointer': isGroupTarget,
      'border-indigo-300 bg-indigo-50': isGroupSource,
      'border-gray-100': !isGroupTarget && !isGroupSource,
      'cursor-pointer': isGroupTarget,
    }"
    @mouseleave="closeMenu"
    @click="handleCardClick"
  >
    <!-- Hidden card -->
    <template v-if="!isVisible">
      <div class="h-10 rounded bg-gray-100" style="filter: blur(4px)" />
      <p class="text-xs text-gray-400 italic">Hidden card by {{ card.authorName }}</p>
    </template>

    <!-- Edit mode -->
    <template v-else-if="editing">
      <textarea
        ref="editTextarea"
        v-model="editText"
        rows="3"
        class="w-full text-sm text-gray-800 resize-none focus:outline-none border border-indigo-300 rounded p-1"
        @keydown="onEditKeydown"
        @click.stop
      />
      <div class="flex gap-2">
        <button
          class="text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 transition-colors"
          @click.stop="submitEdit"
        >
          Save
        </button>
        <button
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          @click.stop="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </template>

    <!-- Normal view -->
    <template v-else>
      <p class="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed pr-6">
        {{ card.text }}
      </p>

      <div class="flex items-center justify-between mt-1">
        <span class="text-xs text-gray-400">{{ card.authorName }}</span>
        <slot name="actions" />
      </div>

      <!-- 3-dot menu (own cards only, not in grouping mode) -->
      <div v-if="isOwn && !pending" class="absolute top-2 right-2">
        <button
          class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-all"
          @click.stop="toggleMenu"
        >
          ···
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-md z-10 py-1 min-w-28"
        >
          <button
            class="w-full text-left text-sm text-gray-700 hover:bg-gray-50 px-4 py-1.5 transition-colors"
            @click.stop="startEdit(); closeMenu()"
          >
            Edit
          </button>
          <button
            class="w-full text-left text-sm text-gray-700 hover:bg-gray-50 px-4 py-1.5 transition-colors"
            @click.stop="socket.toggleHidden({ sessionId, cardId: card.id }); closeMenu()"
          >
            {{ card.hidden ? 'Unhide' : 'Hide' }}
          </button>
          <button
            class="w-full text-left text-sm text-gray-700 hover:bg-gray-50 px-4 py-1.5 transition-colors"
            @click.stop="start(card.id, card.columnId); closeMenu()"
          >
            Start group
          </button>
          <button
            class="w-full text-left text-sm text-red-500 hover:bg-red-50 px-4 py-1.5 transition-colors"
            @click.stop="socket.deleteCard({ sessionId, cardId: card.id }); closeMenu()"
          >
            Delete
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
