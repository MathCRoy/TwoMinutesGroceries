import Dexie, { type EntityTable } from 'dexie'

export interface Recipe {
  id: number
  desc: string
  position: number
}

export interface Ingredient {
  id: number
  desc: string
  measure_unit: string
  is_basic: boolean
  section?: string
}

export interface RecipeIngredientMapper {
  id: number
  recipe_id: number
  ingredient_id: number
  quantity: string
}

class TwoMinutesGroceriesDB extends Dexie {
  recipes!: EntityTable<Recipe, 'id'>
  ingredients!: EntityTable<Ingredient, 'id'>
  recipe_ingredient_mapper!: EntityTable<RecipeIngredientMapper, 'id'>

  constructor() {
    super('TwoMinutesGroceries')
    this.version(1).stores({
      recipes: '++id, desc, position',
      ingredients: '++id, desc, measure_unit',
      recipe_ingredient_mapper: '++id, recipe_id, ingredient_id',
    })
    this.version(2).stores({
      recipes: '++id, desc, position',
      ingredients: '++id, desc, measure_unit, is_basic, section',
      recipe_ingredient_mapper: '++id, recipe_id, ingredient_id',
    })
  }
}

export const db = new TwoMinutesGroceriesDB()

export async function seedIfEmpty() {
  const count = await db.recipes.count()
  if (count > 0) return

  await db.recipes.bulkAdd([
    { desc: 'Recipe 1', position: 1 },
    { desc: 'Recipe 2', position: 2 },
    { desc: 'Recipe 3', position: 3 },
  ])
}
