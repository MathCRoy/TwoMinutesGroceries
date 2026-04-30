<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { db } from '../db'

const props = defineProps<{ ingredient: { id: number, desc: string, measure_unit: string } }>()

const editing = ref(false)
const editDesc = ref('')
const editUnit = ref('')
const inputRef = ref(null)

async function startEdit() {
  editDesc.value = props.ingredient.desc
  editUnit.value = props.ingredient.measure_unit
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
}

async function confirmEdit() {
  if (editDesc.value.trim()) {
    await db.ingredients.update(props.ingredient.id, {
      desc: editDesc.value.trim(),
      measure_unit: editUnit.value ?? ''
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
    if (!wrapperRef.value?.contains(document.activeElement)) {
      cancelEdit()
    }
  }, 150)
}
</script>

<template>
  <v-card class="mb-2 pa-3 d-flex align-center">
    <div class="flex-grow-1">
      <div v-if="editing" ref="wrapperRef" @focusout="onFocusOut">
        <v-text-field
          ref="inputRef"
          v-model="editDesc"
          placeholder="Ingredient name"
          variant="underlined"
          density="compact"
          hide-details
          class="mb-1"
          @keyup.enter="confirmEdit"
          @keyup.esc="cancelEdit"
        />
        <div class="d-flex align-center ga-2">
          <v-select
            v-model="editUnit"
            :items="['cup', 'ml', 'g']"
            placeholder="Unit (optional)"
            variant="underlined"
            density="compact"
            hide-details
            clearable
            class="flex-grow-1"
          />
          <v-btn icon="mdi-check" variant="text" size="small" color="primary" @click="confirmEdit" />
        </div>
      </div>
      <template v-else>
        <span>{{ ingredient.desc }}</span>
        <span v-if="ingredient.measure_unit" class="text-caption text-grey ml-2">({{ ingredient.measure_unit }})</span>
      </template>
    </div>

    <v-btn v-if="!editing" icon="mdi-pencil" variant="text" size="small" color="grey" @click="startEdit" />
  </v-card>
</template>
