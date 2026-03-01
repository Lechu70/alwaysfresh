import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FirstLaunch from './pages/FirstLaunch'
import Home from './pages/Home'
import Pantry from './pages/Pantry'
import Recipes from './pages/Recipes'
import AddItem from './pages/AddItem'
import Camera from './pages/Camera'
import ScanResults from './pages/ScanResults'

function RequireAuth({ children }) {
  const name = localStorage.getItem('userName')
  if (!name) return <Navigate to="/welcome" replace />
  return children
}

function RequireGuest({ children }) {
  const name = localStorage.getItem('userName')
  if (name) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<RequireGuest><FirstLaunch /></RequireGuest>} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/pantry" element={<RequireAuth><Pantry /></RequireAuth>} />
        <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
        <Route path="/add-item"     element={<RequireAuth><AddItem /></RequireAuth>} />
        <Route path="/camera"       element={<RequireAuth><Camera /></RequireAuth>} />
        <Route path="/scan-results" element={<RequireAuth><ScanResults /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
