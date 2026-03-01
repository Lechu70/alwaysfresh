const KEY = 'alwaysfresh_pantry'

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Returns YYYY-MM-DD in local timezone
function localIso(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const SEEDS = [
  { name: 'Strawberries',  category: 'Produce', emoji: '🍓', offset: 0  },
  { name: 'Spinach',       category: 'Produce', emoji: '🥬', offset: 1  },
  { name: 'Whole Milk',    category: 'Dairy',   emoji: '🥛', offset: 3  },
  { name: 'Carrots',       category: 'Produce', emoji: '🥕', offset: 4  },
  { name: 'Apples',        category: 'Produce', emoji: '🍎', offset: 7  },
  { name: 'Cheddar Cheese',category: 'Dairy',   emoji: '🧀', offset: 12 },
]

function createSeeds() {
  const today = localIso()
  return SEEDS.map(s => ({
    item_id: makeId(),
    name: s.name,
    category: s.category,
    emoji: s.emoji,
    date_added: today,
    expiration_date: localIso(s.offset),
    status: 'active',
    notes: '',
  }))
}

export function getItems() {
  const raw = localStorage.getItem(KEY)
  if (raw === null) {
    const seeds = createSeeds()
    localStorage.setItem(KEY, JSON.stringify(seeds))
    return seeds
  }
  return JSON.parse(raw)
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function markUsed(item_id) {
  const updated = getItems().map(i =>
    i.item_id === item_id ? { ...i, status: 'used_up' } : i
  )
  save(updated)
  return updated
}

export function addItem(fields) {
  const all = getItems()
  const item = { item_id: makeId(), date_added: localIso(), status: 'active', notes: '', ...fields }
  const updated = [...all, item]
  save(updated)
  return updated
}
