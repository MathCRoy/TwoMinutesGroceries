import { ref, watch } from 'vue'

function persistedRef<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const initial = stored ? (JSON.parse(stored) as T) : defaultValue
  const state = ref<T>(initial)
  watch(state, val => localStorage.setItem(key, JSON.stringify(val)), { deep: true })
  return state
}

export const selectedRecipeIds = persistedRef<number[]>('groceries:recipeIds', [])
export const selectedIngredientIds = persistedRef<number[]>('groceries:ingredientIds', [])

const storedChecked = localStorage.getItem('groceries:checkedIds')
export const checkedIngredientIds = ref<Set<number>>(
  storedChecked ? new Set<number>(JSON.parse(storedChecked)) : new Set<number>()
)
watch(checkedIngredientIds, val => localStorage.setItem('groceries:checkedIds', JSON.stringify([...val])))
