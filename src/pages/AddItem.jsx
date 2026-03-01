import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem } from '../store/pantry'

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Pantry', 'Other']

const CATEGORY_EMOJI = {
  Produce: '🥦',
  Dairy:   '🥛',
  Meat:    '🥩',
  Bakery:  '🍞',
  Frozen:  '❄️',
  Pantry:  '🥫',
  Other:   '📦',
}

const FieldLabel = ({ children }) => (
  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
    {children}
  </span>
)

const SectionTitle = ({ children }) => (
  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mt-4 mb-1.5">
    {children}
  </p>
)

export default function AddItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', category: '', expiration_date: '', notes: '' })

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const canSubmit = form.name.trim() && form.category && form.expiration_date

  function handleSubmit() {
    if (!canSubmit) return
    addItem({
      name:            form.name.trim(),
      category:        form.category,
      expiration_date: form.expiration_date,
      notes:           form.notes.trim(),
      emoji:           CATEGORY_EMOJI[form.category] ?? '📦',
    })
    navigate('/pantry')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto font-sans">

      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Add Item</h1>
      </header>

      <main className="flex-1 px-4 py-2 pb-36 flex flex-col">

        <SectionTitle>Item Details</SectionTitle>

        {/* Name */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm mb-2.5">
          <FieldLabel>Name <span className="text-red-400 normal-case">*</span></FieldLabel>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Spinach, Whole Milk…"
            autoFocus
            className="w-full mt-2 text-[15px] text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none"
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm mb-2.5">
          <FieldLabel>Category <span className="text-red-400 normal-case">*</span></FieldLabel>
          <select
            value={form.category}
            onChange={set('category')}
            className="w-full mt-2 text-[15px] bg-transparent focus:outline-none cursor-pointer"
            style={{ color: form.category ? '#111827' : '#d1d5db' }}
          >
            <option value="" disabled>Select category…</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} style={{ color: '#111827' }}>{c}</option>
            ))}
          </select>
        </div>

        <SectionTitle>Expiration</SectionTitle>

        {/* Expiration date */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm mb-2.5">
          <FieldLabel>Expiration Date <span className="text-red-400 normal-case">*</span></FieldLabel>
          <input
            type="date"
            value={form.expiration_date}
            onChange={set('expiration_date')}
            className="w-full mt-2 text-[15px] text-gray-900 bg-transparent focus:outline-none"
          />
        </div>

        <SectionTitle>Optional</SectionTitle>

        {/* Notes */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm">
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="e.g. opened, half used…"
            rows={2}
            className="w-full mt-2 text-[15px] text-gray-900 placeholder-gray-300 bg-transparent focus:outline-none resize-none"
          />
        </div>

        <p className="text-[11px] text-gray-300 text-center mt-4">* Required fields</p>

      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 px-4 pt-3 pb-7 flex gap-3 z-20">
        <button
          onClick={() => navigate('/pantry')}
          className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl text-[15px] active:scale-[0.98] transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-[2] py-3.5 bg-green-600 text-white font-bold rounded-2xl text-[15px] disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          Add Item
        </button>
      </div>

    </div>
  )
}
