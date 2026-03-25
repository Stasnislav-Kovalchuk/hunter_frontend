import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getErrorMessage } from '@/services/api'
import * as publicApi from '@/services/publicApi'
import { menuItemToLegacyCard } from '@/utils/menuItemCard'
import searchIcon from '../images/search.png'
import testimage from '../images/testimage.png'
import error404 from '../images/404img.png'
import './SearchPage.css'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debounced = useDebouncedValue(searchQuery, 300)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const q = debounced.trim()
    if (q === '') {
      setResults([])
      setError(null)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setResults([])
      try {
        const items = await publicApi.getPublicMenuItems({
          q,
          is_available: true,
          per_page: 50,
        })
        if (!cancelled) setResults(items.map(menuItemToLegacyCard))
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e))
          setResults([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debounced])

  return (
    <div className="search-page">
      <header className="search-header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="search-input-wrapper">
          <img src={searchIcon} alt="" className="inner-search-icon" />
          <input
            type="search"
            placeholder="Пошук"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="search-results">
        {error ? <div className="search-placeholder-text">{error}</div> : null}
        {loading && debounced.trim() ? <div className="search-placeholder-text">Шукаємо…</div> : null}
        {!loading && !error && debounced.trim() && results.length > 0
          ? results.map((item) => (
              <div key={item.id} className="dish-item-card search-card">
                <div className="dish-text">
                  <h3 className="dish-name">{item.name}</h3>
                  <p className="dish-price">{item.price} грн</p>
                  <p className="dish-description">{item.desc}</p>
                  <span className="dish-meta">{item.weight}</span>
                </div>
                <div className="dish-img-box">
                  <img src={item.image || testimage} alt={item.name} className="dish-img" />
                </div>
              </div>
            ))
          : null}
        {!loading && !error && debounced.trim() && results.length === 0 ? (
          <div className="no-results">
            <img src={error404} alt="" className="img-404" />
            <p>
              Шукали — шукали &quot;{debounced}&quot;
              <br />
              не знайшли
            </p>
          </div>
        ) : null}
        {!searchQuery.trim() ? (
          <div className="search-placeholder-text">Введіть назву страви яку шукаєте</div>
        ) : null}
      </main>
    </div>
  )
}

export default SearchPage
