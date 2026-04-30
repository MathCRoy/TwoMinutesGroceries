<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db } from '../db'
import { selectedRecipeIds, selectedIngredientIds } from '../state/groceriesList'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { t } = useLocale()

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

function toggleIngredient(id: number) {
  selectedIngredientIds.value = selectedIngredientIds.value.includes(id)
    ? selectedIngredientIds.value.filter(x => x !== id)
    : [...selectedIngredientIds.value, id]
}

function clearSelection() {
  selectedRecipeIds.value = []
  selectedIngredientIds.value = []
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">{{ t('create_groceries_list') }}</span>
      <v-spacer />
      <v-btn variant="tonal" size="small" @click="clearSelection">{{ t('clear') }}</v-btn>
    </div>

    <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('basic_ingredients') }}</div>
    <v-card v-if="basicIngredients.length === 0" class="pa-3 text-medium-emphasis mb-2">
      {{ t('no_basic_ingredients') }}
    </v-card>
    <div v-else class="mb-6">
      <v-card
        v-for="ingredient in basicIngredients"
        :key="ingredient.id"
        class="mb-2 pa-3"
        :color="selectedIngredientIds.includes(ingredient.id) ? 'indigo-darken-3' : undefined"
        @click="toggleIngredient(ingredient.id)"
      >
        <span>{{ ingredient.desc }}</span>
        <span v-if="ingredient.measure_unit" class="text-caption ml-2">({{ ingredient.measure_unit }})</span>
      </v-card>
    </div>

    <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('recipes') }}</div>
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
