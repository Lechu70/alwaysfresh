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

// On localhost: call Anthropic directly (requires VITE_CLAUDE_API_KEY in .env)
// In production: call the Netlify Function proxy (no CORS, key stays server-side)
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

async function callClaude(payload) {
  if (isLocal) {
    const key = import.meta.env.VITE_CLAUDE_API_KEY
    if (!key) throw new Error('VITE_CLAUDE_API_KEY not set in .env')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message ?? `API error ${res.status}`)
    }
    return res.json()
  }

  // Production: proxy through Netlify Function to avoid CORS
  const res = await fetch('/.netlify/functions/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${res.status}`)
  }
  return res.json()
}

export async function analyzeGroceryImage(base64, mimeType) {
  const today = localIso()
  const data = await callClaude({
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
[{"name":"Espinaca","category":"Produce","expiration_date":"YYYY-MM-DD"}]
Item names must be in Spanish. Categories must be one of (in English): Produce, Dairy, Meat, Bakery, Frozen, Pantry, Other.
expiration_date must be YYYY-MM-DD — estimate typical shelf life from today.`,
        },
      ],
    }],
  })

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
  const active = pantryItems.filter(i => i.status === 'active')
  if (active.length === 0) return []

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const itemList = active.map(i => {
    const [y, m, d] = i.expiration_date.split('-').map(Number)
    const days = Math.round((new Date(y, m - 1, d) - now) / 86_400_000)
    return `${i.name} (${days} days left)`
  }).join(', ')

  const data = await callClaude({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Tengo estos productos: ${itemList}.
Sugiere 4 recetas usando estos productos. Prioriza los que vencen antes.
Responde SOLO con un array JSON en español (sin markdown, sin explicación):
[{"title":"Nombre de la receta","emoji":"🍳","usesItems":["Espinaca","Zanahoria"],"otherIngredients":["aceite de oliva","sal"],"steps":["Paso 1","Paso 2","Paso 3"]}]
usesItems debe coincidir exactamente con los nombres de mi lista (sin distinción de mayúsculas).`,
    }],
  })

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
