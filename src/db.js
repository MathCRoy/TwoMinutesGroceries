import Dexie from 'dexie'

export const db = new Dexie('TwoMinutesGroceries')

db.version(1).stores({
    recipes: '++id, desc, position'
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