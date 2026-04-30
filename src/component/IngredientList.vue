<script setup lang="ts">
import { ref, nextTick, onUnmounted, computed } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db } from '../db'
import IngredientCard from './IngredientCard.vue'

const router = useRouter()

const ingredients = ref([])
const search = ref('')
const basicOnly = ref(false)
const orderBySection = ref(false)
const SECTIONS = ['Vegie', 'Meat', 'Frozen', 'Dairy', 'Pantry']

const filtered = computed(() => {
  const result = ingredients.value.filter(i =>
    i.desc.toLowerCase().includes(search.value.toLowerCase()) &&
    (!basicOnly.value || i.is_basic)
  )
  if (!orderBySection.value) return result
  return [...result].sort((a, b) => {
    const ai = SECTIONS.indexOf(a.section ?? '')
    const bi = SECTIONS.indexOf(b.section ?? '')
    const sectionDiff = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    if (sectionDiff !== 0) return sectionDiff
    return a.desc.localeCompare(b.desc)
  })
})

const adding = ref(false)
const newDesc = ref('')
const newUnit = ref('')
const newIsBasic = ref(false)
const newSection = ref('')
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
  newIsBasic.value = false
  newSection.value = ''
  await nextTick()
  inputRef.value?.focus()
}

async function confirmAdd() {
  if (newDesc.value.trim()) {
    await db.ingredients.add({
      desc: newDesc.value.trim(),
      measure_unit: newUnit.value ?? '',
      is_basic: newIsBasic.value,
      section: newSection.value ?? ''
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
    const overlay = document.querySelector('.v-overlay-container')
    if (!formRef.value?.contains(document.activeElement) &&
        !overlay?.contains(document.activeElement)) {
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

    <div class="d-flex align-center">
      <v-checkbox v-model="basicOnly" label="Basic only" density="compact" hide-details class="mr-2" />
      <v-checkbox v-model="orderBySection" label="By type" density="compact" hide-details class="mr-2" />
      <v-spacer />
      <v-btn icon="mdi-plus" variant="text" @click="startAdding" />
    </div>

    <v-card v-if="adding" ref="formRef" class="mb-2 pa-2" @focusout="onFocusOut">
      <div class="d-flex align-center ga-2 mb-1">
        <v-text-field
          ref="inputRef"
          v-model="newDesc"
          placeholder="Ingredient name"
          variant="underlined"
          density="compact"
          autofocus
          hide-details
          class="flex-grow-1"
          @keyup.enter="confirmAdd"
          @keyup.esc="cancelAdd"
        />
        <v-checkbox
          v-model="newIsBasic"
          label="Basic"
          density="compact"
          hide-details
        />
        <v-btn icon="mdi-check" variant="text" size="small" color="primary" @click="confirmAdd" />
      </div>
      <div class="d-flex align-center ga-2">
        <v-select
          v-model="newUnit"
          :items="['', 'cup', 'ml', 'g']"
          placeholder="Unit"
          variant="underlined"
          density="compact"
          hide-details
          class="flex-grow-1"
        />
        <v-select
          v-model="newSection"
          :items="['', ...SECTIONS]"
          placeholder="Section"
          variant="underlined"
          density="compact"
          hide-details
          class="flex-grow-1"
        />
      </div>
    </v-card>

    <IngredientCard
      v-for="ingredient in filtered"
      :key="ingredient.id"
      :ingredient="ingredient"
    />
  </div>
</template>
