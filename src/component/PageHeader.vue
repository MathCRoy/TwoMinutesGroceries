<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  back?: string
}>()

const router = useRouter()

function goBack() {
  if (props.back) {
    router.push(props.back)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="d-flex align-center bg-background page-header">
    <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" />
    <span class="text-h6 ml-2">{{ title }}</span>
    <v-spacer v-if="$slots.default" />
    <slot />
  </div>
</template>

<style scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
