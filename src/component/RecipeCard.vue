<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { db } from '../db'

const props = defineProps<{ recipe: { id: number, desc: string, position: number } }>()

const editing = ref(false)
const editDesc = ref('')
const inputRef = ref(null)

async function startEdit() {
  editDesc.value = props.recipe.desc
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
}

async function confirmEdit() {
  if (editDesc.value.trim()) {
    await db.recipes.update(props.recipe.id, { desc: editDesc.value.trim() })
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <v-card class="mb-2 pa-3 d-flex align-center">
    <div class="flex-grow-1">
      <v-text-field
        v-if="editing"
        ref="inputRef"
        v-model="editDesc"
        variant="underlined"
        density="compact"
        hide-details
        @keyup.enter="confirmEdit"
        @keyup.esc="cancelEdit"
        @blur="cancelEdit"
      />
      <span v-else>{{ recipe.desc }}</span>
    </div>

    <v-btn icon="mdi-pencil" variant="text" size="small" color="grey" @click="startEdit" />
    <v-btn icon="mdi-cart-plus" variant="text" size="small" />
  </v-card>
</template>
