import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getErrorMessage } from '@/services/api'
import * as publicApi from '@/services/publicApi'
import { menuItemToLegacyCard } from '@/utils/menuItemCard'
import logo from '../images/logo.png'
import testimage from '../images/testimage.png'
import testimage2 from '../images/testimage2.png'
import search from '../images/search.png'
import './CategoryPage.css'
import '../css/dishmodal.css'
import AboutRestourant from '../components/AboutRestourant/AboutRestourant.jsx'

function buildViewModel(category, items) {
  const cards = items.map(menuItemToLegacyCard)
  return {
    title: category.name,
    subcategories: [{ name: 'Усі страви', items: cards }],
  }
}

function CategoryPage() {
  const { categoryId } = useParams()
  const [data, setData] = useState(null)
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [activeSub, setActiveSub] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const sectionRefs = useRef([])

  useEffect(() => {
    const id = Number(categoryId)
    if (!Number.isFinite(id) || id < 1) {
      setLoading(false)
      setData(null)
      setLoadError('Некоректна категорія')
      return
    }

    let mounted = true
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [categories, items] = await Promise.all([
          publicApi.getPublicCategories(),
          publicApi.getPublicMenuItemsByCategory(id, { is_available: true, per_page: 100 }),
        ])
        if (!mounted) return
        const cat = categories.find((c) => c.id === id)
        if (!cat) {
          setData(null)
          setLoadError('Категорію не знайдено')
          return
        }
        setAllCategories(categories)
        setData(buildViewModel(cat, items))
      } catch (e) {
        if (!mounted) return
        setData(null)
        setLoadError(getErrorMessage(e))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [categoryId])

  useEffect(() => {
    setSelectedDish(null)
    setIsDropdownOpen(false)
    setActiveSub(0)
    window.scrollTo(0, 0)
  }, [categoryId])

  useEffect(() => {
    if (!data) return

    const scrollTabIntoView = () => {
      const activeTab = document.querySelector('.carousel-tab.active')
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          const priorityEntry = visibleEntries.reduce((prev, curr) =>
            prev.boundingClientRect.top > curr.boundingClientRect.top ? curr : prev,
          )
          const index = sectionRefs.current.indexOf(priorityEntry.target)
          if (index !== -1) {
            setActiveSub(index)
            setTimeout(scrollTabIntoView, 50)
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '-130px 0px -40% 0px',
      },
    )

    const currentRefs = sectionRefs.current
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      observer.disconnect()
    }
  }, [categoryId, data])

  useEffect(() => {
    if (selectedDish) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [selectedDish])

  if (loading) {
    return (
      <div className="category-page">
        <div className="error-msg" style={{ padding: '2rem' }}>
          Завантажуємо меню…
        </div>
      </div>
    )
  }

  if (loadError || !data) {
    return (
      <div className="category-page">
        <div className="error-msg">{loadError || 'Категорію не знайдено'}</div>
        <Link to="/">На головну</Link>
      </div>
    )
  }

  const scrollToSection = (index) => {
    setActiveSub(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="category-page">
      <header className="category-top-nav">
        <Link to="/">
          <img src={logo} alt="Logo" className="nav-icon-img" />
        </Link>
        <Link to="/search">
          <button type="button" className="nav-search-btn">
            <img src={search} alt="Search" className="nav-search-icon" />
          </button>
        </Link>
      </header>

      <div className="main-selector-container">
        <div className="custom-dropdown">
          <div
            className={`dropdown-selected-box ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsDropdownOpen(!isDropdownOpen)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="dropdown-label">{data.title}</span>
            <svg
              className={`arrow-icon ${isDropdownOpen ? 'rotate' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="3"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {isDropdownOpen ? (
            <div className="dropdown-list">
              {allCategories
                .filter((c) => String(c.id) !== String(categoryId))
                .map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.id}`}
                    className="dropdown-option"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="subcategory-carousel">
        {data.subcategories.map((sub, index) => (
          <button
            key={sub.name}
            type="button"
            className={`carousel-tab ${activeSub === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <main className="all-dishes-list">
        {data.subcategories.map((sub, subIndex) => (
          <section
            key={sub.name}
            ref={(el) => {
              sectionRefs.current[subIndex] = el
            }}
            className="subcategory-section"
          >
            <h2 className="section-title">{sub.name}</h2>
            {sub.items.length === 0 ? (
              <p className="dish-description" style={{ padding: '1rem' }}>
                У цій категорії поки немає доступних страв
              </p>
            ) : null}
            {sub.items.map((item) => (
              <div
                key={item.id}
                className="dish-item-card"
                onClick={() => setSelectedDish(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedDish(item)
                  }
                }}
                role="button"
                tabIndex={0}
              >
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
            ))}
          </section>
        ))}
      </main>

      {selectedDish ? (
        <div className="modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedDish(null)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="modal-scroll-area">
              <img src={selectedDish.image || testimage2} alt={selectedDish.name} className="modal-main-img" />

              <div className="modal-info">
                <h3 className="modal-title">{selectedDish.name}</h3>
                <p className="modal-price">{selectedDish.price} грн</p>

                <p className="modal-desc">{selectedDish.desc}</p>
                <p className="modal-weight">{selectedDish.weight}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AboutRestourant />
    </div>
  )
}

export default CategoryPage
