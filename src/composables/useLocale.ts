import { ref, watch } from 'vue'

type Locale = 'en' | 'fr'

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) ?? 'en')

watch(locale, (val) => localStorage.setItem('locale', val))

const messages = {
  en: {
    app_name: 'Two Minutes Groceries',
    groceries_list: 'Groceries List',
    recipes: 'Recipes',
    ingredients: 'Ingredients',
    config: 'Config',
    language: 'Language',
    data: 'Data',
    export_data: 'Export Data',
    import_data: 'Import Data',
    import_error: 'Invalid file. Make sure it is a valid export.',
    clear_all_data: 'Clear All Data',
    clear_confirm_title: 'Clear all data?',
    clear_confirm_body: 'This deletes all recipes, ingredients, and mappings. Cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    select: 'Select',
    no_recipes_selected: 'No recipes selected.',
    by_type: 'By type',
    no_ingredients_selected: 'No ingredients selected.',
    other: 'Other',
    create_groceries_list: 'Create Groceries List',
    clear: 'Clear',
    basic_ingredients: 'Basic Ingredients',
    no_basic_ingredients: 'No basic ingredients defined yet.',
    edit_recipe: 'Edit Recipe',
    recipe_name: 'Recipe name',
    new: 'New',
    add: 'Add',
    qty: 'Qty',
    search: 'Search',
    basic_only: 'Basic only',
    ingredient_name: 'Ingredient name',
    basic: 'Basic',
    unit: 'Unit',
    section: 'Section',
    new_ingredient: 'New Ingredient',
    name: 'Name',
  },
  fr: {
    app_name: 'Two Minutes Groceries',
    groceries_list: "Liste d'épicerie",
    recipes: 'Recettes',
    ingredients: 'Ingrédients',
    config: 'Config',
    language: 'Langue',
    data: 'Données',
    export_data: 'Exporter les données',
    import_data: 'Importer les données',
    import_error: "Fichier invalide. Assurez-vous qu'il s'agit d'un export valide.",
    clear_all_data: 'Effacer toutes les données',
    clear_confirm_title: 'Effacer toutes les données ?',
    clear_confirm_body: 'Cela supprime toutes les recettes, ingrédients et associations. Cette action est irréversible.',
    cancel: 'Annuler',
    delete: 'Supprimer',
    select: 'Sélectionner',
    no_recipes_selected: 'Aucune recette sélectionnée.',
    by_type: 'Par type',
    no_ingredients_selected: 'Aucun ingrédient sélectionné.',
    other: 'Autre',
    create_groceries_list: "Créer la liste d'épicerie",
    clear: 'Effacer',
    basic_ingredients: 'Ingrédients de base',
    no_basic_ingredients: 'Aucun ingrédient de base défini.',
    edit_recipe: 'Modifier la recette',
    recipe_name: 'Nom de la recette',
    new: 'Nouveau',
    add: 'Ajouter',
    qty: 'Qté',
    search: 'Rechercher',
    basic_only: 'De base seulement',
    ingredient_name: "Nom de l'ingrédient",
    basic: 'De base',
    unit: 'Unité',
    section: 'Section',
    new_ingredient: 'Nouvel ingrédient',
    name: 'Nom',
  },
}

const sectionLabels: Record<string, Record<string, string>> = {
  en: { Vegie: 'Vegie', Meat: 'Meat', Frozen: 'Frozen', Dairy: 'Dairy', Pantry: 'Pantry' },
  fr: { Vegie: 'Légumes', Meat: 'Viande', Frozen: 'Surgelés', Dairy: 'Produits laitiers', Pantry: 'Garde-manger' },
}

function t(key: keyof typeof messages.en): string {
  return messages[locale.value][key]
}

function tSection(key: string): string {
  return sectionLabels[locale.value][key] ?? key
}

export function useLocale() {
  return { locale, t, tSection }
}
