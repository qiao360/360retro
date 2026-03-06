<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Group } from 'shared/types'
import { useRetroStore } from '../stores/retro'
import { useSocket } from '../composables/useSocket'
import { useGrouping } from '../composables/useGrouping'
import PostItCard from './PostItCard.vue'
import VoteButton from './VoteButton.vue'

const props = defineProps<{ group: Group; sessionId: string }>()

const store = useRetroStore()
const socket = useSocket()
const { pending, cancel, start } = useGrouping()

const cards = computed(() =>
  props.group.cardIds
    .map((id) => store.session?.cards.find((c) => c.id === id))
    .filter((c) => c !== undefined),
)

const totalVotes = computed(() =>
  cards.value.reduce((sum, c) => sum + c.votes.length, 0),
)

// Title editing
const editingTitle = ref(false)
const titleText = ref(props.group.title)
const titleInput = ref<HTMLInputElement | null>(null)

async function startEditTitle() {
  titleText.value = props.group.title
  editingTitle.value = true
  await new Promise((r) => setTimeout(r, 0))
  titleInput.value?.focus()
  titleInput.value?.select()
}

function submitTitle() {
  const t = titleText.value.trim()
  if (t && t !== props.group.title) {
    socket.updateGroupTitle({ sessionId: props.sessionId, groupId: props.group.id, title: t })
  }
  editingTitle.value = false
}

function onTitleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submitTitle()
  if (e.key === 'Escape') editingTitle.value = false
}

// Allow adding a card to this group while in grouping mode
function selectAsGroup() {
  if (!pending.value) return
  socket.addCardToGroup({
    sessionId: props.sessionId,
    groupId: props.group.id,
    cardId: pending.value.cardId,
  })
  cancel()
}

const isGroupTarget = computed(
  () => pending.value !== null && pending.value.columnId === props.group.columnId,
)

function ungroup() {
  socket.deleteGroup({ sessionId: props.sessionId, groupId: props.group.id })
}
</script>

<template>
  <div
    class="rounded-lg border-2 border-dashed overflow-hidden transition-colors"
    :class="isGroupTarget
      ? 'border-indigo-400 bg-indigo-50 cursor-pointer'
      : 'border-gray-200 bg-gray-50'"
    @click="isGroupTarget ? selectAsGroup() : undefined"
  >
    <!-- Group title -->
    <div class="px-3 pt-2 pb-1 flex items-center gap-2">
      <input
        v-if="editingTitle"
        ref="titleInput"
        v-model="titleText"
        class="text-xs font-semibold text-gray-600 bg-transparent border-b border-indigo-400 focus:outline-none w-full"
        @keydown="onTitleKeydown"
        @blur="submitTitle"
      />
      <button
        v-else
        class="text-xs font-semibold text-gray-500 hover:text-gray-700 truncate text-left"
        @click.stop="startEditTitle"
      >
        {{ group.title }}
      </button>
      <span class="text-xs text-gray-400 ml-auto shrink-0">{{ cards.length }} cards</span>
      <span v-if="totalVotes > 0" class="text-xs text-rose-400 shrink-0">♥ {{ totalVotes }}</span>
      <button
        class="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0"
        title="Ungroup"
        @click.stop="ungroup"
      >
        ✕
      </button>
    </div>

    <!-- Cards inside group -->
    <div class="px-2 pb-2 flex flex-col gap-1.5">
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
    </div>
  </div>
</template>
