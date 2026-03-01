import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import { getItems } from '../store/pantry'
import { generateRecipes } from '../utils/recipeGenerator'
import { generateAIRecipes } from '../utils/claudeApi'

function RecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

      <h3 className="text-[16px] font-bold text-gray-900 mb-3">
        {recipe.emoji} {recipe.title}
        {recipe.isAI && <span className="ml-1.5 text-[12px] font-semibold text-purple-500">✨ AI</span>}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {recipe.matchedItems.map(item => (
          <span
            key={item.item_id}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
          >
            {item.emoji} {item.name}
          </span>
        ))}
        {recipe.otherIngredients.map(ing => (
          <span key={ing} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
            {ing}
          </span>
        ))}
      </div>

      {expanded && (
        <ol className="mb-4 flex flex-col gap-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-600 leading-snug">
              <span className="text-green-600 font-bold flex-shrink-0 w-4">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full py-2.5 bg-green-600 text-white text-[13px] font-bold rounded-xl active:scale-[0.98] transition-all"
      >
        {expanded ? 'Hide Recipe' : 'View Recipe'}
      </button>

    </div>
  )
}

export default function Recipes() {
  const [allRecipes, setAllRecipes] = useState(() => generateRecipes(getItems(), null))
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshed, setRefreshed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleRefresh() {
    setSearchQuery('')
    if (!import.meta.env.VITE_CLAUDE_API_KEY) {
      const fresh = generateRecipes(getItems(), null, true)
      setAllRecipes(fresh)
      setRefreshed(true)
      setTimeout(() => setRefreshed(false), 1500)
      return
    }
    setIsLoading(true)
    try {
      const aiRecipes = await generateAIRecipes(getItems())
      setAllRecipes(aiRecipes.length > 0 ? aiRecipes : generateRecipes(getItems(), null, true))
    } catch {
      setAllRecipes(generateRecipes(getItems(), null, true))
    } finally {
      setIsLoading(false)
      setRefreshed(true)
      setTimeout(() => setRefreshed(false), 1500)
    }
  }

  const q = searchQuery.trim().toLowerCase()

  // Recipes shown: top 3 when no search, filtered by pantry ingredient when searching
  const displayRecipes = q
    ? allRecipes.filter(r => r.matchedItems.some(i => i.name.toLowerCase().includes(q)))
    : allRecipes.slice(0, 3)

  // Unique pantry items that appear in any recipe and match the current query
  const suggestions = q
    ? [...new Map(
        allRecipes
          .flatMap(r => r.matchedItems)
          .filter(i => i.name.toLowerCase().includes(q))
          .map(i => [i.item_id, i])
      ).values()]
    : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto font-sans">

      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Recipes for You</h1>
        <p className="text-sm text-gray-500 mt-0.5">Based on what's in your pantry</p>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 flex flex-col gap-3">

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-2.5 flex items-center gap-2">
          <span className="text-gray-400 text-base leading-none">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ingredient…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Suggestion chips — pantry items matching the query */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 -mt-1">
            {suggestions.map(item => (
              <button
                key={item.item_id}
                onClick={() => setSearchQuery(item.name)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 active:scale-95 transition-all"
              >
                {item.emoji} {item.name}
              </button>
            ))}
          </div>
        )}

        {/* Refresh row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {q
              ? `${displayRecipes.length} recipe${displayRecipes.length !== 1 ? 's' : ''} with "${searchQuery}"`
              : `${allRecipes.length} recipe${allRecipes.length !== 1 ? 's' : ''} from your pantry`
            }
          </p>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-[12px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 active:scale-95 transition-all disabled:opacity-60"
          >
            {isLoading
              ? <span className="inline-block animate-spin">↻</span>
              : refreshed ? '✓ Updated' : '↻ Refresh'
            }
          </button>
        </div>

        {/* Recipe cards */}
        {allRecipes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <span className="text-5xl">🍳</span>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              No recipes yet.<br />Add items to your pantry first.
            </p>
          </div>
        ) : displayRecipes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-400 text-sm text-center">
              No recipes found for <span className="font-semibold">"{searchQuery}"</span>.<br />
              Try another ingredient from your pantry.
            </p>
          </div>
        ) : (
          displayRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}

      </main>

      <BottomNav active="recipes" />
    </div>
  )
}
