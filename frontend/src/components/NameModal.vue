<script setup lang="ts">
import { ref } from 'vue'
import { useIdentity } from '../composables/useIdentity'

const { save } = useIdentity()
const name = ref('')
const error = ref('')

function submit() {
  if (!name.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  save(name.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4">
      <h2 class="text-xl font-semibold text-gray-800 mb-1">What's your name?</h2>
      <p class="text-sm text-gray-400 mb-6">Used to identify your cards. No account needed.</p>

      <input
        v-model="name"
        type="text"
        placeholder="Alex"
        autofocus
        class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
        @keydown="onKeydown"
      />
      <p v-if="error" class="text-red-400 text-xs mb-3">{{ error }}</p>

      <button
        class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg py-2.5 transition-colors"
        @click="submit"
      >
        Join
      </button>
    </div>
  </div>
</template>
