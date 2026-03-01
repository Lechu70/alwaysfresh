import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeGroceryImage } from '../utils/claudeApi'

function ScanFrame() {
  const corners = [
    'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl',
    'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr',
    'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl',
    'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br',
  ]
  return (
    <div className="relative w-[240px] h-[200px]">
      {corners.map((cls, i) => (
        <div key={i} className={`absolute w-7 h-7 border-green-400 ${cls}`} />
      ))}
    </div>
  )
}

function AnalyzingOverlay() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
      <span className="text-5xl animate-bounce">🔍</span>
      <p className="text-white font-semibold text-base">Analyzing your photo…</p>
      <p className="text-gray-400 text-sm">Identifying items</p>
    </div>
  )
}

export default function Camera() {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(false)
  const [analyzing, setAnalyzing]     = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true)
      return
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setCameraError(true))

    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  // Resize any image source (video/img) to max 1024px before encoding
  function resizeToBase64(source, srcW, srcH) {
    const MAX = 1024
    const scale = Math.min(1, MAX / Math.max(srcW, srcH))
    const canvas = document.createElement('canvas')
    canvas.width  = Math.round(srcW * scale)
    canvas.height = Math.round(srcH * scale)
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.82).split(',')[1]
  }

  function captureFromVideo() {
    const video = videoRef.current
    const base64 = resizeToBase64(video, video.videoWidth || 640, video.videoHeight || 480)
    return { base64, mimeType: 'image/jpeg' }
  }

  async function runAnalysis(base64, mimeType) {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setAnalyzing(true)
    try {
      const items = await analyzeGroceryImage(base64, mimeType)
      navigate('/scan-results', { state: { items } })
    } catch {
      navigate('/scan-results', { state: { items: null } })
    }
  }

  async function goAnalyze() {
    const { base64, mimeType } = captureFromVideo()
    await runAnalysis(base64, mimeType)
  }

  function handleClose() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    navigate(-1)
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = async () => {
      URL.revokeObjectURL(url)
      const base64 = resizeToBase64(img, img.naturalWidth, img.naturalHeight)
      await runAnalysis(base64, 'image/jpeg')
    }
    img.src = url
  }

  if (analyzing) return <AnalyzingOverlay />

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full max-w-[430px] h-full mx-auto overflow-hidden">

        {/* Live camera or fallback */}
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-5 px-10">
            <span className="text-5xl">📷</span>
            <p className="text-white text-center text-sm leading-relaxed">
              Camera not available.<br />Upload a photo to continue.
            </p>
            <label className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-2xl text-sm cursor-pointer active:scale-95 transition-transform">
              Choose Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-12 flex items-center justify-between z-20">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center text-white text-xl"
          >
            ✕
          </button>
          <button className="w-10 h-10 rounded-full bg-black/45 flex items-center justify-center text-yellow-300 text-lg">
            ⚡
          </button>
        </div>

        {/* Scan frame + hint */}
        {!cameraError && (
          <>
            <div
              className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
              style={{ top: '28%' }}
            >
              <ScanFrame />
            </div>
            <p
              className="absolute left-0 right-0 text-center text-white/75 text-[13px] font-medium z-20"
              style={{ bottom: '150px' }}
            >
              Point at one item or a full haul
            </p>
          </>
        )}

        {/* Bottom controls */}
        {!cameraError && (
          <div className="absolute bottom-0 left-0 right-0 h-[130px] bg-black/55 flex items-center justify-center z-20 pb-6">
            {/* Gallery / file upload */}
            <label className="absolute left-[52px] bottom-[38px] w-12 h-12 rounded-xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-xl cursor-pointer active:scale-95 transition-transform">
              🖼️
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            {/* Capture button */}
            <button
              onClick={goAnalyze}
              className="w-[72px] h-[72px] rounded-full bg-white border-4 border-white/40 shadow-[0_0_0_6px_rgba(255,255,255,0.15)] active:scale-95 transition-transform"
            />
          </div>
        )}

      </div>
    </div>
  )
}
