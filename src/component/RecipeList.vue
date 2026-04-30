<script setup lang="ts">
import { ref, nextTick, onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import draggable from 'vuedraggable'
import { db } from '../db'
import RecipeCard from './RecipeCard.vue'

const recipes = ref([])
const adding = ref(false)
const newDesc = ref('')
const inputRef = ref(null)

const subscription = liveQuery(
  () => db.recipes.orderBy('position').toArray()
).subscribe(result => {
  recipes.value = result
})

onUnmounted(() => subscription.unsubscribe())

async function startAdding() {
  adding.value = true
  newDesc.value = ''
  await nextTick()
  inputRef.value?.focus()
}

async function confirmAdd() {
  if (newDesc.value.trim()) {
    await db.recipes.add({
      desc: newDesc.value.trim(),
      position: recipes.value.length + 1
    })
  }
  adding.value = false
}

function cancelAdd() {
  adding.value = false
}

async function onDragEnd() {
  await db.recipes.bulkPut(
    recipes.value.map((r, i) => ({ ...r, position: i + 1 }))
  )
}
</script>

<template>
  <div>
    <v-btn icon="mdi-plus" variant="text" @click="startAdding" />

    <v-card v-if="adding" class="mb-2 pa-2">
      <v-text-field
        ref="inputRef"
        v-model="newDesc"
        placeholder="Recipe name"
        variant="underlined"
        density="compact"
        autofocus
        hide-details
        @keyup.enter="confirmAdd"
        @keyup.esc="cancelAdd"
      />
    </v-card>

    <draggable
      v-model="recipes"
      item-key="id"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <RecipeCard :recipe="element" />
      </template>
    </draggable>
  </div>
</template>
