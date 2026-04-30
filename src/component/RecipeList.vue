<script setup lang="ts">
import { ref, nextTick, onUnmounted, computed } from 'vue'
import { liveQuery } from 'dexie'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { db } from '../db'
import RecipeCard from './RecipeCard.vue'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { t } = useLocale()

const recipes = ref([])
const search = ref('')
const filtered = computed(() =>
  recipes.value.filter(r => r.desc.toLowerCase().includes(search.value.toLowerCase()))
)
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
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">{{ t('recipes') }}</span>
      <v-spacer />
      <v-btn icon="mdi-plus" variant="text" @click="startAdding" />
    </div>

    <v-text-field
      v-model="search"
      :placeholder="t('search')"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      hide-details
      clearable
      class="mb-3"
    />

    <v-card v-if="adding" class="mb-2 pa-2">
      <v-text-field
        ref="inputRef"
        v-model="newDesc"
        :placeholder="t('recipe_name')"
        variant="underlined"
        density="compact"
        autofocus
        hide-details
        @keyup.enter="confirmAdd"
        @keyup.esc="cancelAdd"
      />
    </v-card>

    <draggable
      v-model="filtered"
      item-key="id"
      :options="{ delay: 200, delayOnTouchOnly: true }"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <RecipeCard :recipe="element" />
      </template>
    </draggable>
  </div>
</template>
