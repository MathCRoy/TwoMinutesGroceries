<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { liveQuery } from 'dexie'
import { db } from '../db'
import NewIngredientDialog from '../component/NewIngredientDialog.vue'
import { useLocale } from '../composables/useLocale'
import PageHeader from '../component/PageHeader.vue'

const route = useRoute()
const { t } = useLocale()
const recipeId = Number(route.params.id)

const recipe = ref<{ id: number; desc: string; position: number } | null>(null)
const allIngredients = ref<{ id: number; desc: string; measure_unit: string }[]>([])
const mappings = ref<{ id: number; recipe_id: number; ingredient_id: number; quantity: string }[]>([])

const recipeSubscription = liveQuery(() => db.recipes.get(recipeId))
  .subscribe(r => { recipe.value = r ?? null })

const mappingSubscription = liveQuery(() =>
  db.recipe_ingredient_mapper.where('recipe_id').equals(recipeId).toArray()
).subscribe(result => { mappings.value = result })

const ingredientsSubscription = liveQuery(() =>
  db.ingredients.orderBy('desc').toArray()
).subscribe(result => { allIngredients.value = result })

onUnmounted(() => {
  recipeSubscription.unsubscribe()
  mappingSubscription.unsubscribe()
  ingredientsSubscription.unsubscribe()
})

const linkedIngredientIds = computed(() => new Set(mappings.value.map(m => m.ingredient_id)))

const recipeIngredients = computed(() =>
  mappings.value
    .map(m => {
      const ingredient = allIngredients.value.find(i => i.id === m.ingredient_id)
      return ingredient ? { ...ingredient, mappingId: m.id, quantity: m.quantity ?? '' } : null
    })
    .filter(Boolean) as { id: number; desc: string; measure_unit: string; mappingId: number; quantity: string }[]
)

const availableIngredients = computed(() =>
  allIngredients.value.filter(i => !linkedIngredientIds.value.has(i.id))
)

const nameEditing = ref(false)
const editName = ref('')
const nameInputRef = ref<HTMLElement | null>(null)

async function startEditName() {
  editName.value = recipe.value?.desc ?? ''
  nameEditing.value = true
  await nextTick()
  nameInputRef.value?.focus()
}

async function saveName() {
  if (editName.value.trim()) {
    await db.recipes.update(recipeId, { desc: editName.value.trim() })
  }
  nameEditing.value = false
}

function cancelEditName() {
  nameEditing.value = false
}

const newIngredientDialog = ref(false)

async function onIngredientCreated(id: number) {
  await db.recipe_ingredient_mapper.add({ recipe_id: recipeId, ingredient_id: id, quantity: '' })
}

const selectedIngredientId = ref<number | null>(null)
const newQuantity = ref('')

async function addIngredient() {
  if (selectedIngredientId.value == null) return
  await db.recipe_ingredient_mapper.add({
    recipe_id: recipeId,
    ingredient_id: selectedIngredientId.value,
    quantity: newQuantity.value.trim()
  })
  selectedIngredientId.value = null
  newQuantity.value = ''
}

async function updateQuantity(mappingId: number, quantity: string) {
  await db.recipe_ingredient_mapper.update(mappingId, { quantity: quantity.trim() })
}

async function removeIngredient(mappingId: number) {
  await db.recipe_ingredient_mapper.delete(mappingId)
}
</script>

<template>
  <div>
    <PageHeader class="mb-4" :title="t('edit_recipe')" />

    <v-card class="mb-6 pa-3">
      <v-text-field
        v-if="nameEditing"
        ref="nameInputRef"
        v-model="editName"
        :label="t('recipe_name')"
        variant="underlined"
        density="compact"
        hide-details
        @keyup.enter="saveName"
        @keyup.esc="cancelEditName"
        @blur="saveName"
      />
      <span v-else class="text-body-1 cursor-pointer" @click="startEditName">{{ recipe?.desc }}</span>
    </v-card>

    <div class="d-flex align-center mb-2">
      <span class="text-subtitle-1">{{ t('ingredients') }}</span>
      <v-spacer />
      <v-btn icon="mdi-plus" variant="text" size="small" @click="newIngredientDialog = true" />
    </div>

    <NewIngredientDialog v-model="newIngredientDialog" @created="onIngredientCreated" />

    <v-card
      v-for="ingredient in recipeIngredients"
      :key="ingredient.mappingId"
      class="mb-2 pa-3 d-flex align-center"
    >
      <div class="flex-grow-1">
        <span>{{ ingredient.desc }}</span>
      </div>
      <v-text-field
        :model-value="ingredient.quantity"
        :suffix="ingredient.measure_unit"
        :placeholder="t('qty')"
        variant="underlined"
        density="compact"
        hide-details
        style="max-width: 80px"
        @change="(e: Event) => updateQuantity(ingredient.mappingId, (e.target as HTMLInputElement).value)"
        @keyup.enter="(e: KeyboardEvent) => (e.target as HTMLInputElement).blur()"
      />
      <v-btn icon="mdi-close" variant="text" size="small" density="compact" color="grey" @click="removeIngredient(ingredient.mappingId)" />
    </v-card>

    <div class="d-flex align-center ga-2 mt-3">
      <v-autocomplete
        v-model="selectedIngredientId"
        :items="availableIngredients"
        item-title="desc"
        item-value="id"
        :placeholder="t('add')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        auto-select-first
        class="flex-grow-1"
      />
      <v-text-field
        v-model="newQuantity"
        :placeholder="t('qty')"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 72px"
        @keyup.enter="addIngredient"
      />
      <v-btn
        icon="mdi-plus"
        variant="text"
        color="primary"
        :disabled="selectedIngredientId == null"
        @click="addIngredient"
      />
    </div>
  </div>
</template>
