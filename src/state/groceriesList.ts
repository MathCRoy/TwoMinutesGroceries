import { ref, computed } from 'vue'

export const selectedRecipeIds = ref<number[]>([])
export const selectedIngredients = ref<{ id: number; quantity: string }[]>([])

export const selectedIngredientIds = computed(() => selectedIngredients.value.map(i => i.id))
