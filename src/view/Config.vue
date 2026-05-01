<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'
import { useLocale } from '../composables/useLocale'
import PageHeader from '../component/PageHeader.vue'

const router = useRouter()
const { locale, t } = useLocale()
const confirmClear = ref(false)
const importError = ref('')

async function exportData() {
  const [recipes, ingredients, mappers] = await Promise.all([
    db.recipes.toArray(),
    db.ingredients.toArray(),
    db.recipe_ingredient_mapper.toArray(),
  ])
  const blob = new Blob([JSON.stringify({ recipes, ingredients, recipe_ingredient_mapper: mappers }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'two-minutes-groceries.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function importData(event: Event) {
  importError.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await db.transaction('rw', db.recipes, db.ingredients, db.recipe_ingredient_mapper, async () => {
      await db.recipes.clear()
      await db.ingredients.clear()
      await db.recipe_ingredient_mapper.clear()
      await db.recipes.bulkAdd(data.recipes ?? [])
      await db.ingredients.bulkAdd(data.ingredients ?? [])
      await db.recipe_ingredient_mapper.bulkAdd(data.recipe_ingredient_mapper ?? [])
    })
    router.push('/')
  } catch {
    importError.value = t('import_error')
  }
}

async function clearAll() {
  await db.transaction('rw', db.recipes, db.ingredients, db.recipe_ingredient_mapper, async () => {
    await db.recipes.clear()
    await db.ingredients.clear()
    await db.recipe_ingredient_mapper.clear()
  })
  confirmClear.value = false
  router.push('/')
}
</script>

<template>
  <div class="d-flex flex-column ga-4 mt-4">
    <PageHeader :title="t('config')" back="/" />

    <v-card color="transparent" flat>
      <v-card-title>{{ t('language') }}</v-card-title>
      <v-card-text>
        <v-btn-toggle v-model="locale" mandatory density="compact">
          <v-btn value="en">EN</v-btn>
          <v-btn value="fr">FR</v-btn>
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <v-card color="transparent" flat>
      <v-card-title>{{ t('data') }}</v-card-title>
      <v-card-text class="d-flex flex-column ga-3">
        <v-btn prepend-icon="mdi-download" @click="exportData">{{ t('export_data') }}</v-btn>

        <v-btn prepend-icon="mdi-upload" @click="($refs.fileInput as HTMLInputElement).click()">
          {{ t('import_data') }}
        </v-btn>
        <input ref="fileInput" type="file" accept=".json" class="d-none" @change="importData" />
        <v-alert v-if="importError" type="error" density="compact">{{ importError }}</v-alert>

        <v-btn color="error" prepend-icon="mdi-delete-forever" @click="confirmClear = true">
          {{ t('clear_all_data') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-dialog v-model="confirmClear" max-width="360">
      <v-card>
        <v-card-title>{{ t('clear_confirm_title') }}</v-card-title>
        <v-card-text>{{ t('clear_confirm_body') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmClear = false">{{ t('cancel') }}</v-btn>
          <v-btn color="error" @click="clearAll">{{ t('delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
