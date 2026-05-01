<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { liveQuery } from 'dexie'
import { db, type Recipe, type Ingredient } from '../db'
import { selectedRecipeIds, selectedIngredientIds } from '../state/groceriesList'
import { useLocale } from '../composables/useLocale'
import PageHeader from '../component/PageHeader.vue'

const { t } = useLocale()

const search = ref('')

const recipes = ref<Recipe[]>([])
const basicIngredients = ref<Ingredient[]>([])

const filteredRecipes = computed(() =>
  recipes.value.filter(r => r.desc.toLowerCase().includes(search.value.toLowerCase()))
)

const filteredIngredients = computed(() =>
  basicIngredients.value.filter(i => i.desc.toLowerCase().includes(search.value.toLowerCase()))
)

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
    <PageHeader class="mb-2" :title="t('create_groceries_list')">
      <v-btn variant="tonal" size="small" @click="clearSelection">{{ t('clear') }}</v-btn>
    </PageHeader>

    <v-text-field
      v-model="search"
      :placeholder="t('search')"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-4"
    />

    <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('basic_ingredients') }}</div>
    <v-card v-if="filteredIngredients.length === 0" class="pa-3 text-medium-emphasis mb-2">
      {{ t('no_basic_ingredients') }}
    </v-card>
    <div v-else class="mb-6">
      <v-card
        v-for="ingredient in filteredIngredients"
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
        v-for="recipe in filteredRecipes"
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
