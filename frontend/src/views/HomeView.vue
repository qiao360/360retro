<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sessionName = ref('')
const loading = ref(false)
const error = ref('')

async function createSession() {
  if (!sessionName.value.trim()) {
    error.value = 'Please enter a session name'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sessionName.value.trim() }),
    })

    if (!res.ok) throw new Error('Failed to create session')

    const { id } = await res.json()
    router.push(`/retro/${id}`)
  } catch {
    error.value = 'Could not create session. Is the server running?'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md mx-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-1">360retro</h1>
      <p class="text-gray-400 mb-8">Collaborative retrospectives</p>

      <label class="block text-sm font-medium text-gray-600 mb-1">Session name</label>
      <input
        v-model="sessionName"
        type="text"
        placeholder="Sprint 42 Retro"
        class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
        @keydown.enter="createSession"
      />
      <p v-if="error" class="text-red-400 text-xs mb-3">{{ error }}</p>

      <button
        :disabled="loading"
        class="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition-colors"
        @click="createSession"
      >
        {{ loading ? 'Creating...' : 'Create session' }}
      </button>

      <p class="text-center text-sm text-gray-400 mt-6">
        Already have a link? Just open it.
      </p>
    </div>
  </div>
</template>
