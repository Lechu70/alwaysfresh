import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FirstLaunch() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('userName', trimmed)
    navigate('/')
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
            Track your food, reduce waste,<br />eat better every day.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              What's your name?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-sm"
          >
            Get Started
          </button>
        </form>

      </div>
    </div>
  )
}
