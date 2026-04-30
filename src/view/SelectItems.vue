<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db } from '../db'
import { selectedRecipeIds, selectedIngredients } from '../state/groceriesList'

const router = useRouter()

const recipes = ref([])
const basicIngredients = ref([])

const recipeSub = liveQuery(
  () => db.recipes.orderBy('position').toArray()
).subscribe(result => { recipes.value = result })

const ingredientSub = liveQuery(
  () => db.ingredients.filter(i => i.is_basic).sortBy('desc')
).subscribe(result => { basicIngredients.value = result })

onUnmounted(() => {
  recipeSub.unsubscribe()
  ingredientSub.unsubscribe()
})

function toggleRecipe(id: number) {
  selectedRecipeIds.value = selectedRecipeIds.value.includes(id)
    ? selectedRecipeIds.value.filter(x => x !== id)
    : [...selectedRecipeIds.value, id]
}

function isIngredientSelected(id: number) {
  return selectedIngredients.value.some(i => i.id === id)
}

function getIngredientQty(id: number) {
  return selectedIngredients.value.find(i => i.id === id)?.quantity ?? ''
}

function toggleIngredient(id: number) {
  if (isIngredientSelected(id)) {
    selectedIngredients.value = selectedIngredients.value.filter(i => i.id !== id)
  } else {
    selectedIngredients.value = [...selectedIngredients.value, { id, quantity: '' }]
  }
}

function setIngredientQty(id: number, quantity: string) {
  selectedIngredients.value = selectedIngredients.value.map(i =>
    i.id === id ? { ...i, quantity: quantity.trim() } : i
  )
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">Create Groceries List</span>
    </div>

    <div class="text-subtitle-1 font-weight-bold mb-2">Basic Ingredients</div>
    <v-card v-if="basicIngredients.length === 0" class="pa-3 text-medium-emphasis mb-2">
      No basic ingredients defined yet.
    </v-card>
    <div v-else class="mb-6">
      <v-card
        v-for="ingredient in basicIngredients"
        :key="ingredient.id"
        class="mb-2 pa-3"
        :color="isIngredientSelected(ingredient.id) ? 'indigo-darken-3' : undefined"
        @click="toggleIngredient(ingredient.id)"
      >
        <div class="d-flex align-center">
          <span class="flex-grow-1">{{ ingredient.desc }}</span>
          <v-text-field
            v-if="isIngredientSelected(ingredient.id)"
            :model-value="getIngredientQty(ingredient.id)"
            :suffix="ingredient.measure_unit || undefined"
            placeholder="Qty"
            variant="underlined"
            density="compact"
            hide-details
            style="max-width: 80px"
            @click.stop
            @change="(e: Event) => setIngredientQty(ingredient.id, (e.target as HTMLInputElement).value)"
            @keyup.enter="(e: KeyboardEvent) => (e.target as HTMLInputElement).blur()"
          />
        </div>
      </v-card>
    </div>

    <div class="text-subtitle-1 font-weight-bold mb-2">Recipes</div>
    <div>
      <v-card
        v-for="recipe in recipes"
        :key="recipe.id"
        class="mb-2 pa-3"
        :color="selectedRecipeIds.includes(recipe.id) ? 'indigo-darken-3' : undefined"
        @click="toggleRecipe(recipe.id)"
      >
        <span>{{ recipe.desc }}</span>
      </v-card>
    </div>
  </div>
</template>
