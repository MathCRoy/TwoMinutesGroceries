<script setup lang="ts">
defineProps<{ recipe: { id: number, desc: string, position: number } }>()
</script>

<template>
  <v-card class="mb-2 pa-3">
    {{ recipe.desc }}
  </v-card>
</template>
