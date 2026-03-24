import { Navigate, Route, Routes } from 'react-router-dom'
import MenuPage from './pages/customer/MenuPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/menu/1" replace />} />

      {/* Customer */}
      <Route path="/menu/:restaurantId" element={<MenuPage />} />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

