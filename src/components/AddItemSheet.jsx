import { useNavigate } from 'react-router-dom'

export default function AddItemSheet({ open, onClose }) {
  const navigate = useNavigate()

  function handleManual() {
    onClose()
    navigate('/add-item')
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-[430px] mx-auto bg-white rounded-t-3xl px-5 pt-4 pb-8 transition-transform duration-200 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <h3 className="text-base font-bold text-gray-900 mb-4">Agregar Producto</h3>

        <div className="flex flex-col gap-3">

          <button
            onClick={handleManual}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-left active:bg-gray-100 transition-colors"
          >
            <span className="text-2xl w-10 text-center">✏️</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Ingresar manualmente</p>
              <p className="text-xs text-gray-400 mt-0.5">Completa los detalles a mano</p>
            </div>
          </button>

          <button
            onClick={() => { onClose(); navigate('/camera') }}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-left active:bg-gray-100 transition-colors"
          >
            <span className="text-2xl w-10 text-center">📷</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Escanear productos</p>
              <p className="text-xs text-gray-400 mt-0.5">Apunta a uno o varios productos</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}
