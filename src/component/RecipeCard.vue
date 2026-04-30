<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ recipe: { id: number, desc: string, position: number } }>()
const router = useRouter()
</script>

<template>
  <v-card class="mb-2 pa-3 d-flex align-center">
    <div class="flex-grow-1">
      <span>{{ recipe.desc }}</span>
    </div>
    <v-btn icon="mdi-pencil" variant="text" size="small" color="grey" @click="router.push(`/recipes/${recipe.id}/edit`)" />
    <v-btn icon="mdi-cart-plus" variant="text" size="small" />
  </v-card>
</template>
