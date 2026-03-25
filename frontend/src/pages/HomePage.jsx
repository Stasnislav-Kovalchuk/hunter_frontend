import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/services/api'
import * as publicApi from '@/services/publicApi'
import Header from '../components/Header/Header.jsx'
import AboutRestourant from '../components/AboutRestourant/AboutRestourant.jsx'
import '../css/main.css'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await publicApi.getPublicCategories()
        if (!mounted) return
        setCategories(list)
      } catch (e) {
        if (!mounted) return
        setError(getErrorMessage(e))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="App">
      <Header />
      <main className="menu-container">
        {loading ? <div className="error-msg">Завантажуємо категорії…</div> : null}
        {error ? <div className="error-msg">{error}</div> : null}
        {!loading && !error
          ? categories.map((c) => (
              <Link to={`/category/${c.id}`} key={c.id} className="menu-item-link">
                <button type="button" className="menu-item-btn">
                  <span className="menu-item-text">{c.name}</span>
                  <svg
                    className="menu-item-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </Link>
            ))
          : null}
        {!loading && !error && categories.length === 0 ? (
          <div className="error-msg">Категорій поки немає</div>
        ) : null}
        <AboutRestourant />
      </main>
    </div>
  )
}

export default HomePage
