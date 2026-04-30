<script setup lang="ts">
import { ref, computed } from 'vue'
import { db } from '../db'
import { useLocale } from '../composables/useLocale'

const open = defineModel<boolean>()

const emit = defineEmits<{ created: [id: number] }>()

const { t, tSection } = useLocale()

const SECTIONS = ['Vegie', 'Meat', 'Frozen', 'Dairy', 'Pantry']
const sectionItems = computed(() => ['', ...SECTIONS].map(s => ({ title: s ? tSection(s) : '', value: s })))

const name = ref('')
const unit = ref('')
const isBasic = ref(false)
const section = ref('')

async function confirm() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  const id = await db.ingredients.add({ desc: trimmed, measure_unit: unit.value ?? '', is_basic: isBasic.value, section: section.value ?? '' })
  emit('created', id as number)
  close()
}

function close() {
  open.value = false
  name.value = ''
  unit.value = ''
  isBasic.value = false
  section.value = ''
}
</script>

<template>
  <v-dialog v-model="open" max-width="320">
    <v-card>
      <v-card-title class="text-subtitle-1 pt-4 px-4">{{ t('new_ingredient') }}</v-card-title>
      <v-card-text class="pb-2">
        <v-text-field
          v-model="name"
          :label="t('name')"
          variant="underlined"
          density="compact"
          hide-details
          autofocus
          class="mb-3"
          @keyup.enter="confirm"
          @keyup.esc="close"
        />
        <div class="d-flex align-center ga-2 mb-2">
          <v-select
            v-model="unit"
            :items="['', 'cup', 'ml', 'g']"
            :label="unit ? '' : t('unit')"
            variant="underlined"
            density="compact"
            hide-details
            style="flex: 1 1 0; min-width: 0"
          />
          <v-select
            v-model="section"
            :items="sectionItems"
            :label="section ? '' : t('section')"
            variant="underlined"
            density="compact"
            hide-details
            style="flex: 1 1 0; min-width: 0"
          />
        </div>
        <v-checkbox
          v-model="isBasic"
          :label="t('basic')"
          density="compact"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn :text="t('cancel')" variant="text" @click="close" />
        <v-btn :text="t('add')" variant="text" color="primary" :disabled="!name.trim()" @click="confirm" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
