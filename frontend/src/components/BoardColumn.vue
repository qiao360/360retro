<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Column, Card, Group } from 'shared/types'
import { useGrouping } from '../composables/useGrouping'
import PostItCard from './PostItCard.vue'
import CardGroup from './CardGroup.vue'
import VoteButton from './VoteButton.vue'

const props = defineProps<{ column: Column; cards: Card[]; groups: Group[]; sessionId: string }>()
const emit = defineEmits<{ addCard: [text: string] }>()

const { pending, cancel } = useGrouping()
const isGroupingInColumn = computed(
  () => pending.value !== null && pending.value.columnId === props.column.id,
)

const colorClasses: Record<string, { header: string; border: string; dot: string }> = {
  green: { header: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400' },
  amber: { header: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  blue:  { header: 'bg-blue-50',  border: 'border-blue-200',  dot: 'bg-blue-400'  },
}

const totalCards = computed(() =>
  props.cards.length + props.groups.reduce((n, g) => n + g.cardIds.length, 0),
)

const showForm = ref(false)
const newText = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)

async function openForm() {
  showForm.value = true
  await new Promise((r) => setTimeout(r, 0))
  textarea.value?.focus()
}

function submit() {
  const text = newText.value.trim()
  if (!text) return cancelForm()
  emit('addCard', text)
  newText.value = ''
  showForm.value = false
}

function cancelForm() {
  newText.value = ''
  showForm.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  if (e.key === 'Escape') cancelForm()
}
</script>

<template>
  <div class="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden flex-1 min-w-64">
    <!-- Column header -->
    <div
      class="flex items-center gap-2 px-4 py-3 border-b"
      :class="[colorClasses[column.color]?.header, colorClasses[column.color]?.border]"
    >
      <span class="w-2 h-2 rounded-full" :class="colorClasses[column.color]?.dot" />
      <span class="font-semibold text-gray-700 text-sm">{{ column.title }}</span>
      <span class="ml-auto text-xs text-gray-400">{{ totalCards }}</span>
    </div>

    <!-- Grouping hint -->
    <div
      v-if="isGroupingInColumn"
      class="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-600"
    >
      <span>Click a card or group to merge</span>
      <button class="ml-auto underline hover:no-underline" @click="cancel">Cancel</button>
    </div>

    <!-- Cards & groups -->
    <div class="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
      <!-- Ungrouped cards -->
      <PostItCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :session-id="sessionId"
      >
        <template #actions>
          <VoteButton :card-id="card.id" :session-id="sessionId" />
        </template>
      </PostItCard>

      <!-- Groups -->
      <CardGroup
        v-for="group in groups"
        :key="group.id"
        :group="group"
        :session-id="sessionId"
      />

      <!-- Inline add form -->
      <div v-if="showForm" class="bg-white rounded-lg border border-indigo-300 shadow-sm p-3">
        <textarea
          ref="textarea"
          v-model="newText"
          rows="3"
          placeholder="Type your note…"
          class="w-full text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none"
          @keydown="onKeydown"
        />
        <div class="flex gap-2 mt-2">
          <button
            class="text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 transition-colors"
            @click="submit"
          >
            Add
          </button>
          <button
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="cancelForm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-3 pb-3">
      <button
        v-if="!showForm"
        class="w-full text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg py-2 transition-colors text-left px-2"
        @click="openForm"
      >
        + Add card
      </button>
    </div>
  </div>
</template>
