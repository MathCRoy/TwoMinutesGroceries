<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db } from '../db'
import { selectedRecipeIds, selectedIngredients as selectedBasicIngredients } from '../state/groceriesList'

const router = useRouter()

const allRecipes = ref([])
const allIngredients = ref([])
const recipeIngredientMappings = ref([])

const recipeSub = liveQuery(
  () => db.recipes.orderBy('position').toArray()
).subscribe(result => { allRecipes.value = result })

const ingredientSub = liveQuery(
  () => db.ingredients.orderBy('desc').toArray()
).subscribe(result => { allIngredients.value = result })

const mappingSub = liveQuery(
  () => db.recipe_ingredient_mapper.toArray()
).subscribe(result => { recipeIngredientMappings.value = result })

onUnmounted(() => {
  recipeSub.unsubscribe()
  ingredientSub.unsubscribe()
  mappingSub.unsubscribe()
})

const selectedRecipes = computed(() =>
  allRecipes.value.filter(r => selectedRecipeIds.value.includes(r.id))
)

function sumQuantities(...quantities: string[]): string {
  const nums = quantities.map(q => parseFloat(q)).filter(n => !isNaN(n))
  if (nums.length === 0) return ''
  const total = nums.reduce((a, b) => a + b, 0)
  return Number.isInteger(total) ? String(total) : total.toFixed(2).replace(/\.?0+$/, '')
}

const selectedIngredients = computed(() => {
  const basicIds = selectedBasicIngredients.value.map(i => i.id)
  const recipeIngredientIds = recipeIngredientMappings.value
    .filter(m => selectedRecipeIds.value.includes(m.recipe_id))
    .map(m => m.ingredient_id)

  const allIds = [...new Set([...basicIds, ...recipeIngredientIds])]

  return allIngredients.value
    .filter(i => allIds.includes(i.id))
    .map(ingredient => {
      const recipeMappings = recipeIngredientMappings.value.filter(
        m => selectedRecipeIds.value.includes(m.recipe_id) && m.ingredient_id === ingredient.id
      )
      const basicEntry = selectedBasicIngredients.value.find(i => i.id === ingredient.id)

      const totalQty = sumQuantities(
        ...(basicEntry ? [basicEntry.quantity] : []),
        ...recipeMappings.map(m => m.quantity ?? '')
      )

      return { ...ingredient, totalQty }
    })
})
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">Groceries List</span>
      <v-spacer />
      <v-btn icon="mdi-plus" variant="text" @click="router.push('/groceries-list/select')" />
    </div>

    <div class="mb-6">
      <div class="text-subtitle-1 font-weight-bold mb-2">Recipes</div>
      <v-card v-if="selectedRecipes.length === 0" class="pa-3 text-medium-emphasis">
        No recipes selected.
      </v-card>
      <v-card
        v-for="recipe in selectedRecipes"
        :key="recipe.id"
        class="mb-2 pa-3"
      >
        {{ recipe.desc }}
      </v-card>
    </div>

    <div>
      <div class="text-subtitle-1 font-weight-bold mb-2">Ingredients</div>
      <v-card v-if="selectedIngredients.length === 0" class="pa-3 text-medium-emphasis">
        No ingredients selected.
      </v-card>
      <v-card
        v-for="ingredient in selectedIngredients"
        :key="ingredient.id"
        class="mb-2 pa-3 d-flex align-center"
      >
        <span class="flex-grow-1">{{ ingredient.desc }}</span>
        <span v-if="ingredient.totalQty || ingredient.measure_unit" class="text-body-2 text-grey">
          {{ ingredient.totalQty }}<span v-if="ingredient.measure_unit"> {{ ingredient.measure_unit }}</span>
        </span>
      </v-card>
    </div>
  </div>
</template>
