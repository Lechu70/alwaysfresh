import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem } from '../store/pantry'

function localIso(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const POOL = [
  { name: 'Broccoli',       category: 'Produce', emoji: '🥦', offset: 4  },
  { name: 'Blueberries',    category: 'Produce', emoji: '🫐', offset: 3  },
  { name: 'Greek Yogurt',   category: 'Dairy',   emoji: '🫙', offset: 7  },
  { name: 'Chicken Breast', category: 'Meat',    emoji: '🍗', offset: 2  },
  { name: 'Sourdough',      category: 'Bakery',  emoji: '🍞', offset: 3  },
  { name: 'Bell Pepper',    category: 'Produce', emoji: '🫑', offset: 5  },
  { name: 'Butter',         category: 'Dairy',   emoji: '🧈', offset: 14 },
  { name: 'Tomatoes',       category: 'Produce', emoji: '🍅', offset: 5  },
]

function buildMockItems() {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, 3)
  return shuffled.map((item, i) => ({
    tempId: i,
    name:            item.name,
    category:        item.category,
    emoji:           item.emoji,
    // Last item intentionally has no date — demonstrates the validation flow
    expiration_date: i < 2 ? localIso(item.offset) : '',
  }))
}

const CATEGORY_STYLE = {
  Produce: 'bg-green-50 text-green-700',
  Dairy:   'bg-blue-50 text-blue-700',
  Meat:    'bg-red-50 text-red-700',
  Bakery:  'bg-amber-50 text-amber-700',
  Frozen:  'bg-cyan-50 text-cyan-700',
  Pantry:  'bg-purple-50 text-purple-700',
  Other:   'bg-gray-100 text-gray-600',
}

function ItemCard({ item, hasError, onChange }) {
  const [editingName, setEditingName]   = useState(false)
  const [editingExpiry, setEditingExpiry] = useState(false)
  const nameInputRef = useRef(null)

  const missingExpiry = !item.expiration_date

  function commitName() { setEditingName(false) }

  function toggleNameEdit() {
    setEditingName(e => !e)
    setTimeout(() => nameInputRef.current?.focus(), 30)
  }

  return (
    <div className={`bg-white rounded-2xl p-4 border-[1.5px] shadow-sm transition-colors ${
      hasError && missingExpiry ? 'border-red-300' : 'border-gray-100'
    }`}>

      {/* Name row */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-[26px] leading-none flex-shrink-0">{item.emoji}</span>
        {editingName ? (
          <input
            ref={nameInputRef}
            value={item.name}
            onChange={e => onChange({ ...item, name: e.target.value })}
            onBlur={commitName}
            onKeyDown={e => e.key === 'Enter' && commitName()}
            className="flex-1 text-[16px] font-bold text-gray-900 border-b-2 border-green-500 focus:outline-none bg-transparent"
          />
        ) : (
          <span className="flex-1 text-[16px] font-bold text-gray-900">{item.name}</span>
        )}
        <button onClick={toggleNameEdit} className="text-sm text-gray-300 hover:text-gray-500 p-1 transition-colors">
          ✏️
        </button>
      </div>

      {/* Category + Expiry fields */}
      <div className="flex gap-2">

        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</p>
          <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLE[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {item.category}
          </span>
        </div>

        <div className={`flex-1 rounded-xl px-3 py-2.5 ${
          hasError && missingExpiry ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
            hasError && missingExpiry ? 'text-red-500' : 'text-gray-400'
          }`}>
            {hasError && missingExpiry ? 'Expires ✕ Required' : 'Expires'}
          </p>

          {editingExpiry ? (
            <input
              type="date"
              autoFocus
              value={item.expiration_date}
              onChange={e => {
                onChange({ ...item, expiration_date: e.target.value })
                if (e.target.value) setEditingExpiry(false)
              }}
              onBlur={() => setEditingExpiry(false)}
              className="text-[12px] font-semibold text-gray-900 bg-transparent focus:outline-none w-full"
            />
          ) : item.expiration_date ? (
            <button
              onClick={() => setEditingExpiry(true)}
              className="text-[13px] font-semibold text-gray-900 text-left w-full"
            >
              {formatDate(item.expiration_date)}
            </button>
          ) : (
            <button
              onClick={() => setEditingExpiry(true)}
              className={`text-[13px] font-semibold italic text-left w-full ${
                hasError ? 'text-red-400' : 'text-amber-500'
              }`}
            >
              Tap to add →
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default function ScanResults() {
  const navigate = useNavigate()
  const [items, setItems]         = useState(() => buildMockItems())
  const [showError, setShowError] = useState(false)

  function handleChange(updated) {
    const next = items.map(i => i.tempId === updated.tempId ? updated : i)
    setItems(next)
    // Auto-clear error state once all items are complete
    if (showError && next.every(i => i.name.trim() && i.expiration_date)) {
      setShowError(false)
    }
  }

  function handleConfirm() {
    const incomplete = items.filter(i => !i.name.trim() || !i.expiration_date)
    if (incomplete.length > 0) {
      setShowError(true)
      return
    }
    items.forEach(item =>
      addItem({
        name:            item.name.trim(),
        category:        item.category,
        expiration_date: item.expiration_date,
        emoji:           item.emoji,
        notes:           '',
      })
    )
    navigate('/pantry')
  }

  const incompleteCount = items.filter(i => !i.name.trim() || !i.expiration_date).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto font-sans">

      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/camera')}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Items Found</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              AI identified {items.length} items — review and confirm
            </p>
          </div>
        </div>
      </header>

      {/* Validation error banner */}
      {showError && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2 text-red-600 text-[13px] font-semibold flex-shrink-0">
          ⚠️ Please complete all required fields
        </div>
      )}

      <main className="flex-1 px-4 py-4 pb-36 flex flex-col gap-2.5">
        {items.map(item => (
          <ItemCard
            key={item.tempId}
            item={item}
            hasError={showError}
            onChange={handleChange}
          />
        ))}

        <button
          onClick={() => navigate('/add-item')}
          className="w-full py-3.5 border-2 border-green-600 text-green-600 font-bold rounded-2xl text-sm mt-1 active:scale-[0.98] transition-all"
        >
          + Add item manually
        </button>
      </main>

      {/* Confirm bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 px-4 pt-3 pb-7 z-20">
        <p className={`text-[12px] font-semibold text-center mb-2 ${
          showError ? 'text-red-500' : 'text-gray-400'
        }`}>
          {showError
            ? `${incompleteCount} item${incompleteCount !== 1 ? 's' : ''} need${incompleteCount === 1 ? 's' : ''} attention`
            : `${items.length - incompleteCount} item${items.length - incompleteCount !== 1 ? 's' : ''} ready to add`
          }
        </p>
        <button
          onClick={handleConfirm}
          disabled={showError && incompleteCount > 0}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl text-[15px] disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          Confirm All
        </button>
      </div>

    </div>
  )
}
