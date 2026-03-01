import { RECIPE_TEMPLATES } from './recipeData'

function itemMatchesTriggers(item, triggers) {
  const name = item.name.toLowerCase()
  return triggers.some(t => name.includes(t.toLowerCase()))
}

// count = null → return all recipes with at least 1 match
// count = N    → return top N recipes with at least 1 match
// shuffle = true randomises within equal-score tiers (used by Refresh)
export function generateRecipes(pantryItems, count = 3, shuffle = false) {
  const active = pantryItems.filter(i => i.status === 'active')

  const scored = RECIPE_TEMPLATES.map(recipe => {
    const matchedItems = active.filter(item => itemMatchesTriggers(item, recipe.triggers))
    return { ...recipe, matchedItems, score: matchedItems.length }
  })

  const withMatch = [...scored]
    .filter(r => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return shuffle ? Math.random() - 0.5 : 0
    })

  return count === null ? withMatch : withMatch.slice(0, count)
}
