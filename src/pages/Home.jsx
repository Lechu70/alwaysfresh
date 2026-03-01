import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { getItems } from '../store/pantry'
import { daysLeft, formatExpiry } from '../utils/pantryUtils'
import { generateRecipes } from '../utils/recipeGenerator'

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

const BADGE = {
  red:    'bg-red-50 text-red-500',
  yellow: 'bg-amber-50 text-amber-600',
}

export default function Home() {
  const navigate = useNavigate()
  const name = localStorage.getItem('userName') || 'there'

  // Re-computed on each mount (tab switch causes remount)
  const [expiring] = useState(() =>
    getItems()
      .filter(i => i.status === 'active')
      .map(i => ({ ...i, days: daysLeft(i.expiration_date) }))
      .filter(i => i.days <= 5)
      .sort((a, b) => a.days - b.days)
      .slice(0, 4)
  )

  const [recipePreview] = useState(() =>
    generateRecipes(getItems(), null)
      .map(recipe => ({
        ...recipe,
        minDays: Math.min(...recipe.matchedItems.map(i => daysLeft(i.expiration_date))),
      }))
      .sort((a, b) =>
        a.minDays !== b.minDays
          ? a.minDays - b.minDays
          : b.matchedItems.length - a.matchedItems.length
      )
      .slice(0, 2)
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto font-sans">

      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 sticky top-0 z-10">
        <p className="text-sm text-gray-500">Good {timeOfDay()}, {name} 👋</p>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">Always Fresh</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-36 flex flex-col gap-3">

        {/* Expiring Soon */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-gray-900">⚠️ Expiring Soon</h2>
            <button onClick={() => navigate('/pantry')} className="text-xs font-semibold text-green-600">
              See all →
            </button>
          </div>

          {expiring.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nothing expiring soon — you're all good! 🎉
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {expiring.map(item => (
                <div key={item.item_id} className="flex items-center gap-2.5 py-2.5">
                  <span className="text-[22px] w-8 text-center leading-none">{item.emoji || '📦'}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${BADGE[item.days <= 2 ? 'red' : 'yellow']}`}>
                    {formatExpiry(item.days)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Recipes */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-gray-900">👨‍🍳 Recommended Recipes</h2>
            <button onClick={() => navigate('/recipes')} className="text-xs font-semibold text-green-600">
              See all →
            </button>
          </div>

          {recipePreview.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Add items to your pantry to see recipe suggestions.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {recipePreview.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => navigate('/recipes')}
                  className="flex items-center gap-3 py-3 text-left w-full"
                >
                  <span className="text-2xl leading-none">{recipe.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{recipe.title}</p>
                    {recipe.matchedItems.length > 0 && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5 truncate">
                        Uses: {recipe.matchedItems.map(i => i.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300 text-lg flex-shrink-0">›</span>
                </button>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Scan button — floats above bottom nav */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-20">
        <button
          onClick={() => navigate('/camera')}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(22,163,74,0.35)] active:scale-[0.98] transition-all"
        >
          📷 Scan Items
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  )
}
