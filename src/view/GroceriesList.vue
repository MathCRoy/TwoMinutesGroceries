<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from 'vue'
import { liveQuery } from 'dexie'
import { useRouter } from 'vue-router'
import { db, type Recipe, type Ingredient, type RecipeIngredientMapper } from '../db'
import { selectedRecipeIds, selectedIngredientIds } from '../state/groceriesList'
import { useLocale } from '../composables/useLocale'

const SECTIONS = ['Vegie', 'Meat', 'Frozen', 'Dairy', 'Pantry']

const router = useRouter()
const { t, tSection } = useLocale()

const allRecipes = ref<Recipe[]>([])
const allIngredients = ref<Ingredient[]>([])
const recipeIngredientMappings = ref<RecipeIngredientMapper[]>([])

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
  const recipeIngredientIds = recipeIngredientMappings.value
    .filter(m => selectedRecipeIds.value.includes(m.recipe_id))
    .map(m => m.ingredient_id)

  const allIds = [...new Set([...selectedIngredientIds.value, ...recipeIngredientIds])]

  return allIngredients.value
    .filter(i => allIds.includes(i.id))
    .map(ingredient => {
      const recipeMappings = recipeIngredientMappings.value.filter(
        m => selectedRecipeIds.value.includes(m.recipe_id) && m.ingredient_id === ingredient.id
      )
      const isBasic = selectedIngredientIds.value.includes(ingredient.id)

      const totalQty = sumQuantities(
        ...(isBasic ? ['1'] : []),
        ...recipeMappings.map(m => m.quantity ?? '')
      )

      return { ...ingredient, totalQty }
    })
})

const sortByType = ref(false)

const ingredientsBySection = computed(() => {
  const groups: { label: string; items: typeof selectedIngredients.value }[] = []
  const sectionOrder = [...SECTIONS, '']

  for (const section of sectionOrder) {
    const items = selectedIngredients.value.filter(i => (i.section ?? '') === section)
    if (items.length > 0) {
      groups.push({ label: section ? tSection(section) : t('other'), items })
    }
  }
  return groups
})

const openPanels = ref<number[]>([])

watch(sortByType, (on) => {
  if (on) openPanels.value = ingredientsBySection.value.map((_, i) => i)
})

const checkedIds = ref<Set<number>>(new Set())

function toggleIngredient(id: number) {
  const next = new Set(checkedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  checkedIds.value = next
}

function allChecked(items: { id: number }[]): boolean {
  return items.length > 0 && items.every(i => checkedIds.value.has(i.id))
}

</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <span class="text-h6 ml-2">{{ t('groceries_list') }}</span>
      <v-spacer />
      <v-btn variant="tonal" size="small" @click="router.push('/groceries-list/select')">{{ t('select') }}</v-btn>
    </div>

    <div class="mb-6">
      <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('recipes') }}</div>
      <v-card v-if="selectedRecipes.length === 0" class="pa-3 text-medium-emphasis">
        {{ t('no_recipes_selected') }}
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
      <div class="d-flex align-center mb-2">
        <span class="text-subtitle-1 font-weight-bold">{{ t('ingredients') }}</span>
        <v-spacer />
        <v-checkbox
          v-model="sortByType"
          :label="t('by_type')"
          density="compact"
          hide-details
        />
      </div>

      <v-card v-if="selectedIngredients.length === 0" class="pa-3 text-medium-emphasis">
        {{ t('no_ingredients_selected') }}
      </v-card>

      <template v-else-if="!sortByType">
        <v-card
          v-for="ingredient in selectedIngredients"
          :key="ingredient.id"
          class="mb-2 pa-3 d-flex align-center ingredient-card"
          :class="{ 'ingredient-checked': checkedIds.has(ingredient.id) }"
          @click="toggleIngredient(ingredient.id)"
        >
          <span class="flex-grow-1">{{ ingredient.desc }}</span>
          <span v-if="(ingredient.totalQty && ingredient.totalQty !== '1') || ingredient.measure_unit" class="text-body-2 text-grey">
            {{ [ingredient.totalQty !== '1' ? ingredient.totalQty : '', ingredient.measure_unit].filter(Boolean).join(' ') }}
          </span>
        </v-card>
      </template>

      <v-expansion-panels v-else v-model="openPanels" multiple variant="accordion" elevation="0">
        <v-expansion-panel
          v-for="(group, idx) in ingredientsBySection"
          :key="group.label"
          :value="idx"
          bg-color="transparent"
          class="mb-3"
        >
          <v-expansion-panel-title :class="{ 'section-checked': allChecked(group.items) }">
            <span class="font-weight-medium">{{ group.label }}</span>
            <span class="text-caption text-grey ml-2">({{ group.items.length }})</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card
              v-for="ingredient in group.items"
              :key="ingredient.id"
              class="mb-2 pa-3 d-flex align-center ingredient-card"
              :class="{ 'ingredient-checked': checkedIds.has(ingredient.id) }"
              @click="toggleIngredient(ingredient.id)"
            >
              <span class="flex-grow-1">{{ ingredient.desc }}</span>
              <span v-if="(ingredient.totalQty && ingredient.totalQty !== '1') || ingredient.measure_unit" class="text-body-2 text-grey">
                {{ [ingredient.totalQty !== '1' ? ingredient.totalQty : '', ingredient.measure_unit].filter(Boolean).join(' ') }}
              </span>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<style scoped>
.ingredient-card {
  cursor: pointer;
  transition: opacity 0.2s;
}
.ingredient-checked {
  opacity: 0.2;
}
:deep(.v-expansion-panel-title.section-checked) {
  opacity: 0.2;
  transition: opacity 0.2s;
}

:deep(.v-expansion-panel::after),
:deep(.v-expansion-panel--active + .v-expansion-panel::before),
:deep(.v-expansion-panel::before) {
  box-shadow: none;
  border: none;
}
:deep(.v-expansion-panel-title) {
  background-color: rgb(var(--v-theme-surface));
}
:deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 0 8px 16px;
}
</style>
