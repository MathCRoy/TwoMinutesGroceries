import { createRouter, createWebHistory } from 'vue-router'
import Home from '../view/Home.vue'
import Recipes from '../view/Recipes.vue'
import Ingredients from '../view/Ingredients.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/recipes', component: Recipes },
    { path: '/ingredients', component: Ingredients },
  ],
})

export default router
