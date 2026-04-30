import { createRouter, createWebHistory } from 'vue-router'
import Home from '../view/Home.vue'
import Recipes from '../view/Recipes.vue'
import Ingredients from '../view/Ingredients.vue'
import RecipeEdit from '../view/RecipeEdit.vue'
import GroceriesList from '../view/GroceriesList.vue'
import SelectItems from '../view/SelectItems.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/recipes', component: Recipes },
    { path: '/recipes/:id/edit', component: RecipeEdit },
    { path: '/ingredients', component: Ingredients },
    { path: '/groceries-list', component: GroceriesList },
    { path: '/groceries-list/select', component: SelectItems },
  ],
})

export default router
