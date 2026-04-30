<template>
  <v-app>
    <v-main>
      <v-container max-width="480px">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>

<script setup lang="ts">
import { seedIfEmpty } from './db'
seedIfEmpty()
</script>