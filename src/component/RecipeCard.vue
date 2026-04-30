<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ recipe: { id: number, desc: string, position: number } }>()
const router = useRouter()
</script>

<template>
  <v-card class="mb-2 pa-3 d-flex align-center" style="cursor: pointer" @click="router.push(`/recipes/${recipe.id}/edit`)">
    <div class="flex-grow-1">
      <span>{{ recipe.desc }}</span>
    </div>
  </v-card>
</template>
