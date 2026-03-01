import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TIPS = [
  {
    emoji: '📦',
    text: 'Controlá todo lo que comprás y que nada se pudra.',
  },
  {
    emoji: '📷',
    text: 'Escaneá y Always Fresh detecta los productos y sugiere la fecha de vencimiento. Sino, ajustala a gusto — ¡o cargá los productos vos también!',
  },
  {
    emoji: '👨‍🍳',
    text: '¿No sabés qué cocinar? Te recomendamos recetas con lo próximo a vencer y lo que más tenés.',
  },
]

function OnboardingModal({ name, onDone }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-0">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-6 pb-10 flex flex-col gap-6">

        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">¡Hola, {name}! 👋</p>
          <p className="text-sm text-gray-500 mt-1">Esto es lo que podés hacer con Always Fresh:</p>
        </div>

        <div className="flex flex-col gap-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl">
                {tip.emoji}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-snug mt-0.5">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onDone}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-[15px] active:scale-[0.98] transition-all shadow-sm"
        >
          ¡Empecemos!
        </button>

      </div>
    </div>
  )
}

export default function FirstLaunch() {
  const [name, setName] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('userName', trimmed)
    setShowOnboarding(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 font-sans max-w-[430px] mx-auto">
      <div className="w-full flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🥬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Always Fresh</h1>
          <p className="text-gray-500 text-center text-sm leading-relaxed">
            Controlá tus alimentos, reducí el desperdicio,<br />comé mejor cada día.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              ¿Cómo te llamas?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Alex"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm"
          >
            Empezar
          </button>
        </form>

      </div>

      {showOnboarding && (
        <OnboardingModal name={name.trim()} onDone={() => navigate('/')} />
      )}
    </div>
  )
}
