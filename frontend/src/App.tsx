import { Navigate, Route, Routes } from 'react-router-dom'
import CategoryPage from './pages/CategoryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import MenuPage from './pages/customer/MenuPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Клієнтське меню: категорії та страви з бекенду */}
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Окремий потік: меню з API за ID ресторану (QR) */}
      <Route path="/menu/:restaurantId" element={<MenuPage />} />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
