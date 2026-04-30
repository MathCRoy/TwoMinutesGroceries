<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { t } = useLocale()
</script>

<template>
  <div class="d-flex flex-column ga-3 mt-6">
    <div class="d-flex align-center">
      <v-icon icon="mdi-cart-heart" size="36" color="primary" class="mr-2" />
      <span class="text-h5 font-weight-bold flex-grow-1">{{ t('app_name') }}</span>
      <v-btn icon="mdi-cog" variant="text" @click="router.push('/config')" />
    </div>
    <v-divider class="mb-2" />
    <v-btn size="x-large" block @click="router.push('/groceries-list')">{{ t('groceries_list') }}</v-btn>
    <v-btn size="x-large" block @click="router.push('/recipes')">{{ t('recipes') }}</v-btn>
    <v-btn size="x-large" block @click="router.push('/ingredients')">{{ t('ingredients') }}</v-btn>
  </div>
</template>
