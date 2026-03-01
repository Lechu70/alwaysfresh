const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

const CATEGORY_EMOJI = {
  Produce: '🥬',
  Dairy:   '🥛',
  Meat:    '🍗',
  Bakery:  '🍞',
  Frozen:  '❄️',
  Pantry:  '🥫',
  Other:   '📦',
}

function localIso() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function stripFences(text) {
  return text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
}

function apiHeaders() {
  return {
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-calls': 'true',
    'content-type': 'application/json',
  }
}

export async function analyzeGroceryImage(base64, mimeType) {
  if (!API_KEY) throw new Error('VITE_CLAUDE_API_KEY not set')

  const today = localIso()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          {
            type: 'text',
            text: `Today is ${today}. Identify all grocery items visible in this image.
Return ONLY a JSON array (no markdown, no explanation):
[{"name":"Spinach","category":"Produce","expiration_date":"YYYY-MM-DD"}]
Categories must be one of: Produce, Dairy, Meat, Bakery, Frozen, Pantry, Other.
expiration_date must be YYYY-MM-DD — estimate typical shelf life from today.`,
          },
        ],
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  const parsed = JSON.parse(stripFences(text))

  return parsed.map((item, i) => ({
    tempId: i,
    name: item.name,
    category: item.category in CATEGORY_EMOJI ? item.category : 'Other',
    expiration_date: item.expiration_date ?? '',
    emoji: CATEGORY_EMOJI[item.category] ?? '📦',
  }))
}

export async function generateAIRecipes(pantryItems) {
  if (!API_KEY) throw new Error('VITE_CLAUDE_API_KEY not set')

  const active = pantryItems.filter(i => i.status === 'active')
  if (active.length === 0) return []

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const itemList = active.map(i => {
    const [y, m, d] = i.expiration_date.split('-').map(Number)
    const days = Math.round((new Date(y, m - 1, d) - now) / 86_400_000)
    return `${i.name} (${days} days left)`
  }).join(', ')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `I have these grocery items: ${itemList}.
Suggest 4 recipes using these items. Prioritize items expiring soonest.
Return ONLY a JSON array (no markdown, no explanation):
[{"title":"Recipe Name","emoji":"🍳","usesItems":["Spinach","Carrots"],"otherIngredients":["olive oil","salt"],"steps":["Step 1","Step 2","Step 3"]}]
usesItems must exactly match names from my item list (case-insensitive ok).`,
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  const parsed = JSON.parse(stripFences(text))

  return parsed.map((recipe, i) => {
    const matchedItems = (recipe.usesItems ?? []).flatMap(name => {
      const found = active.find(p => p.name.toLowerCase() === name.toLowerCase())
      return found ? [found] : []
    })
    return {
      id: `ai-${i}`,
      title: recipe.title,
      emoji: recipe.emoji ?? '🍽️',
      otherIngredients: recipe.otherIngredients ?? [],
      steps: recipe.steps ?? [],
      matchedItems,
      isAI: true,
    }
  })
}
