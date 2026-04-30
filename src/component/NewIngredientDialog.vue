<script setup lang="ts">
import { ref } from 'vue'
import { db } from '../db'

const open = defineModel<boolean>()

const emit = defineEmits<{ created: [id: number] }>()

const name = ref('')
const unit = ref('')
const isBasic = ref(false)

async function confirm() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  const id = await db.ingredients.add({ desc: trimmed, measure_unit: unit.value ?? '', is_basic: isBasic.value })
  emit('created', id as number)
  close()
}

function close() {
  open.value = false
  name.value = ''
  unit.value = ''
  isBasic.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="320">
    <v-card>
      <v-card-title class="text-subtitle-1 pt-4 px-4">New Ingredient</v-card-title>
      <v-card-text class="pb-2">
        <v-text-field
          v-model="name"
          label="Name"
          variant="underlined"
          density="compact"
          hide-details
          autofocus
          class="mb-3"
          @keyup.enter="confirm"
          @keyup.esc="close"
        />
        <v-select
          v-model="unit"
          :items="['cup', 'ml', 'g']"
          label="Unit"
          variant="underlined"
          density="compact"
          hide-details
          clearable
          class="mb-2"
        />
        <v-checkbox
          v-model="isBasic"
          label="Basic"
          density="compact"
          hide-details
        />
      </v-card-text>
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn text="Cancel" variant="text" @click="close" />
        <v-btn text="Add" variant="text" color="primary" :disabled="!name.trim()" @click="confirm" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
