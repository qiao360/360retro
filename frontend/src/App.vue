<script setup lang="ts">
import { useIdentity } from './composables/useIdentity'
import NameModal from './components/NameModal.vue'

const { identity } = useIdentity()
</script>

<template>
  <RouterView />
  <NameModal v-if="!identity" />
</template>
