import { useState, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import AddItemSheet from '../components/AddItemSheet'
import { getItems, markUsed as storeMarkUsed } from '../store/pantry'
import { daysLeft, getUrgency, formatExpiry } from '../utils/pantryUtils'

const SECTIONS = [
  {
    urgency: 'red',
    label: '⚠️ Usar Ya',
    border: 'border-l-red-500',
    tag: 'bg-red-50 text-red-500',
  },
  {
    urgency: 'yellow',
    label: '🟡 Usar Pronto',
    border: 'border-l-amber-400',
    tag: 'bg-amber-50 text-amber-600',
  },
  {
    urgency: 'green',
    label: '✅ Fresco',
    border: 'border-l-green-500',
    tag: 'bg-green-50 text-green-700',
  },
]

const CATEGORY_ES = {
  Produce: 'Verduras', Dairy: 'Lácteos', Meat: 'Carnes',
  Bakery: 'Panadería', Frozen: 'Congelados', Pantry: 'Despensa', Other: 'Otro',
}

function ItemCard({ item, onMarkUsed }) {
  const days = daysLeft(item.expiration_date)
  const section = SECTIONS.find(s => s.urgency === getUrgency(days))

  return (
    <div className={`bg-white rounded-2xl pl-4 pr-3 py-3.5 flex items-center gap-3 border-l-4 shadow-sm ${section.border}`}>
      <span className="text-[28px] leading-none w-9 text-center flex-shrink-0">
        {item.emoji || '📦'}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
          {item.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {CATEGORY_ES[item.category] ?? item.category}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${section.tag}`}>
            {formatExpiry(days)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onMarkUsed(item.item_id)}
        className="text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 whitespace-nowrap active:scale-95 transition-all flex-shrink-0"
      >
        ✓ Usado
      </button>
    </div>
  )
}

export default function Pantry() {
  const [items, setItems] = useState(() =>
    getItems().filter(i => i.status === 'active')
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleMarkUsed = useCallback((item_id) => {
    const updated = storeMarkUsed(item_id)
    setItems(updated.filter(i => i.status === 'active'))
  }, [])

  const grouped = SECTIONS.map(s => ({
    ...s,
    items: items
      .filter(i => getUrgency(daysLeft(i.expiration_date)) === s.urgency)
      .sort((a, b) => daysLeft(a.expiration_date) - daysLeft(b.expiration_date)),
  }))

  const totalActive = items.length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto font-sans">

      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi Despensa</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {totalActive === 0 ? 'Sin productos' : `${totalActive} producto${totalActive !== 1 ? 's' : ''} activo${totalActive !== 1 ? 's' : ''}`}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 pb-36 flex flex-col">
        {totalActive === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
            <span className="text-5xl">📦</span>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Tu despensa está vacía.<br />Toca + para agregar tu primer producto.
            </p>
          </div>
        ) : (
          grouped.map(({ urgency, label, items: group }) => {
            if (group.length === 0) return null
            return (
              <section key={urgency} className="mb-5">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2.5">
                  {label}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {group.map(item => (
                    <ItemCard key={item.item_id} item={item} onMarkUsed={handleMarkUsed} />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* FAB — aligned to container right edge */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none z-20 px-5">
        <div className="flex justify-end">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-14 h-14 bg-green-600 text-white text-3xl font-light rounded-[18px] shadow-[0_4px_20px_rgba(22,163,74,0.45)] flex items-center justify-center active:scale-95 transition-all pointer-events-auto"
          >
            +
          </button>
        </div>
      </div>

      <AddItemSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <BottomNav active="pantry" />
    </div>
  )
}
