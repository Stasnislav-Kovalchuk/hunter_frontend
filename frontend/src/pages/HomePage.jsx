import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/services/api'
import * as publicApi from '@/services/publicApi'
import Header from '../components/Header/Header.jsx'
import AboutRestourant from '../components/AboutRestourant/AboutRestourant.jsx'
import { rootsFromFlat, sortRoots } from '@/utils/categoryTree'
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
        const [tree, flat] = await Promise.all([
          publicApi.getPublicCategoryTree().catch(() => []),
          publicApi.getPublicCategories().catch(() => []),
        ])
        if (!mounted) return
        const roots = tree.length > 0 ? sortRoots(tree) : rootsFromFlat(flat)
        setCategories(roots)
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

  const showContent = !loading && !error
  const aboutDelayMs = 140 + Math.min(categories.length, 12) * 70

  return (
    <div className={`App home-page ${!loading ? 'home-page--ready' : ''}`}>
      <Header />
      <main className="menu-container">
        {loading ? (
          <div className="home-loading" aria-busy="true" aria-label="Завантаження">
            <div className="home-loading__pulse" />
            <span className="home-loading__text">Завантажуємо категорії…</span>
          </div>
        ) : null}
        {error ? <div className="error-msg">{error}</div> : null}
        {showContent
          ? categories.map((c, index) => (
              <Link
                to={`/category/${c.id}`}
                key={c.id}
                className="menu-item-link home-menu-item-enter"
                style={{ '--home-i': index }}
              >
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
        {showContent && categories.length === 0 ? (
          <div className="error-msg home-empty-enter">Категорій поки немає</div>
        ) : null}
        {showContent ? (
          <div
            className="home-about-enter"
            style={{ '--home-about-delay': `${aboutDelayMs}ms` }}
          >
            <AboutRestourant />
          </div>
        ) : !loading ? (
          <div className="home-about-enter" style={{ '--home-about-delay': '220ms' }}>
            <AboutRestourant />
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default HomePage
