<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="d-flex flex-column ga-3 mt-4">
    <v-btn size="x-large" @click="router.push('/recipes')">Recipes</v-btn>
    <v-btn size="x-large" @click="router.push('/ingredients')">Ingredients</v-btn>
    <v-btn size="x-large" @click="router.push('/groceries-list')">Groceries List</v-btn>
  </div>
</template>
