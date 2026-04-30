<script setup lang="ts">
import { ref, nextTick, onUnmounted, computed } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db } from '../db'
import IngredientCard from './IngredientCard.vue'

const router = useRouter()

const ingredients = ref([])
const search = ref('')
const filtered = computed(() =>
  ingredients.value.filter(i => i.desc.toLowerCase().includes(search.value.toLowerCase()))
)
const adding = ref(false)
const newDesc = ref('')
const newUnit = ref('')
const inputRef = ref(null)

const subscription = liveQuery(
  () => db.ingredients.orderBy('desc').toArray()
).subscribe(result => {
  ingredients.value = result
})

onUnmounted(() => subscription.unsubscribe())

async function startAdding() {
  adding.value = true
  newDesc.value = ''
  newUnit.value = ''
  await nextTick()
  inputRef.value?.focus()
}

async function confirmAdd() {
  if (newDesc.value.trim()) {
    await db.ingredients.add({
      desc: newDesc.value.trim(),
      measure_unit: newUnit.value ?? ''
    })
  }
  adding.value = false
}

function cancelAdd() {
  adding.value = false
}

const formRef = ref(null)

function onFocusOut() {
  setTimeout(() => {
    if (!formRef.value?.contains(document.activeElement)) {
      cancelAdd()
    }
  }, 150)
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">Ingredients</span>
    </div>

    <v-text-field
      v-model="search"
      placeholder="Search"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      clearable
      class="mb-3"
    />

    <v-btn icon="mdi-plus" variant="text" @click="startAdding" />

    <v-card v-if="adding" ref="formRef" class="mb-2 pa-2" @focusout="onFocusOut">
      <v-text-field
        ref="inputRef"
        v-model="newDesc"
        placeholder="Ingredient name"
        variant="underlined"
        density="compact"
        autofocus
        hide-details
        class="mb-1"
        @keyup.enter="confirmAdd"
        @keyup.esc="cancelAdd"
      />
      <div class="d-flex align-center ga-2">
        <v-select
          v-model="newUnit"
          :items="['cup', 'ml', 'g']"
          placeholder="Unit (optional)"
          variant="underlined"
          density="compact"
          hide-details
          clearable
          class="flex-grow-1"
        />
        <v-btn icon="mdi-check" variant="text" size="small" color="primary" @click="confirmAdd" />
      </div>
    </v-card>

    <IngredientCard
      v-for="ingredient in filtered"
      :key="ingredient.id"
      :ingredient="ingredient"
    />
  </div>
</template>
