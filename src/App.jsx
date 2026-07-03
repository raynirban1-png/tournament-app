import { HashRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

// HashRouter is used deliberately: GitHub Pages serves static files with
// no server-side rewrite rules, so a path-based router would 404 on
// refresh or direct links. Hash routing (/#/admin) always resolves to
// index.html first, avoiding that problem entirely.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  )
}
