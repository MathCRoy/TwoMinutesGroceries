import Dexie from 'dexie'

export const db = new Dexie('TwoMinutesGroceries')

db.version(1).stores({
    recipes: '++id, desc, position',
    ingredients: '++id, desc, measure_unit',
    recipe_ingredient_mapper: '++id, recipe_id, ingredient_id'
})

db.version(2).stores({
    recipes: '++id, desc, position',
    ingredients: '++id, desc, measure_unit, is_basic, section',
    recipe_ingredient_mapper: '++id, recipe_id, ingredient_id'
})   

export async function seedIfEmpty() {
    const count = await db.recipes.count()
    if (count > 0) return

    await db.recipes.bulkAdd([
        { desc: 'Recipe 1', position: 1},
        { desc: 'Recipe 2', position: 2},
        { desc: 'Recipe 3', position: 3}
    ])
}