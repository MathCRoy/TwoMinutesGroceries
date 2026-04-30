<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { db } from '../db'

const SECTIONS = ['Vegie', 'Meat', 'Frozen', 'Dairy', 'Pantry']

const SECTION_CONFIG: Record<string, { abbr: string; color: string }> = {
  Vegie:  { abbr: 'v', color: 'green' },
  Meat:   { abbr: 'M', color: 'red' },
  Frozen: { abbr: 'F', color: 'light-blue-lighten-2' },
  Dairy:  { abbr: 'D', color: 'amber-lighten-2' },
  Pantry: { abbr: 'P', color: 'brown-lighten-2' },
}

const props = defineProps<{ ingredient: { id: number, desc: string, measure_unit: string, is_basic: boolean, section?: string } }>()

const editing = ref(false)
const editDesc = ref('')
const editUnit = ref('')
const editIsBasic = ref(false)
const editSection = ref('')
const inputRef = ref(null)

async function startEdit() {
  editDesc.value = props.ingredient.desc
  editUnit.value = props.ingredient.measure_unit
  editIsBasic.value = props.ingredient.is_basic ?? false
  editSection.value = props.ingredient.section ?? ''
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
}

async function confirmEdit() {
  if (editDesc.value.trim()) {
    await db.ingredients.update(props.ingredient.id, {
      desc: editDesc.value.trim(),
      measure_unit: editUnit.value ?? '',
      is_basic: editIsBasic.value,
      section: editSection.value ?? ''
    })
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

const wrapperRef = ref(null)

function onFocusOut() {
  setTimeout(() => {
    const overlay = document.querySelector('.v-overlay-container')
    if (!wrapperRef.value?.contains(document.activeElement) &&
        !overlay?.contains(document.activeElement)) {
      cancelEdit()
    }
  }, 150)
}
</script>

<template>
  <v-card class="mb-2 pa-3 d-flex align-center" :style="!editing ? 'cursor: pointer' : ''" @click="!editing && startEdit()">
    <div class="flex-grow-1">
      <div v-if="editing" ref="wrapperRef" @focusout="onFocusOut">
        <div class="d-flex align-center ga-2 mb-1">
          <v-text-field
            ref="inputRef"
            v-model="editDesc"
            placeholder="Ingredient name"
            variant="underlined"
            density="compact"
            hide-details
            class="flex-grow-1"
            @keyup.enter="confirmEdit"
            @keyup.esc="cancelEdit"
          />
          <v-checkbox
            v-model="editIsBasic"
            label="Basic"
            density="compact"
            hide-details
          />
          <v-btn icon="mdi-check" variant="text" size="small" color="primary" @click="confirmEdit" />
        </div>
        <div class="d-flex align-center ga-2">
          <v-select
            v-model="editUnit"
            :items="['', 'cup', 'ml', 'g']"
            placeholder="Unit"
            variant="underlined"
            density="compact"
            hide-details
            class="flex-grow-1"
          />
          <v-select
            v-model="editSection"
            :items="['', ...SECTIONS]"
            placeholder="Section"
            variant="underlined"
            density="compact"
            hide-details
            class="flex-grow-1"
          />
        </div>
      </div>
      <template v-else>
        <span>{{ ingredient.desc }}</span>
        <v-chip v-if="ingredient.is_basic" size="x-small" color="primary" variant="tonal" class="ml-2">B</v-chip>
        <v-chip v-if="ingredient.section && SECTION_CONFIG[ingredient.section]" size="x-small" :color="SECTION_CONFIG[ingredient.section].color" variant="tonal" class="ml-2">{{ SECTION_CONFIG[ingredient.section].abbr }}</v-chip>
      </template>
    </div>

    <span v-if="!editing && ingredient.measure_unit" class="text-caption text-grey">{{ ingredient.measure_unit }}</span>
  </v-card>
</template>
