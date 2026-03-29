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
import {
  buildContextFromFlat,
  findCategoryContext,
  rootsFromFlat,
  sortRoots,
} from '@/utils/categoryTree'

function buildViewModel(category, items) {
  const cards = items.map(menuItemToLegacyCard)
  return {
    title: category.name,
    subcategories: [{ id: category.id, name: 'Усі страви', items: cards }],
  }
}

/** Розділ: товари по всьому дереву; групуємо по підкатегоріях */
function buildSectionViewModel(section, items) {
  const children = section.children || []
  if (children.length === 0) {
    return {
      title: section.name,
      subcategories: [{ id: `all-${section.id}`, name: 'Усі страви', items: items.map(menuItemToLegacyCard) }],
    }
  }
  return {
    title: section.name,
    subcategories: children.map((sub) => ({
      id: sub.id,
      name: sub.name,
      items: items.filter((it) => it.category_id === sub.id).map(menuItemToLegacyCard),
    })),
  }
}

function CategoryPage() {
  const { categoryId } = useParams()
  const [data, setData] = useState(null)
  /** Розділи верхнього рівня для дропдауну */
  const [navRoots, setNavRoots] = useState([])
  const [resolvedSectionId, setResolvedSectionId] = useState(null)
  const [viewKind, setViewKind] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const [activeSub, setActiveSub] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const sectionRefs = useRef([])
  const carouselRef = useRef(null)
  /** Після першого успішного завантаження — переключення категорій без повноекранного лоадера */
  const hasLoadedOnceRef = useRef(false)

  useEffect(() => {
    const id = Number(categoryId)
    if (!Number.isFinite(id) || id < 1) {
      setLoading(false)
      setRefreshing(false)
      setData(null)
      setLoadError('Некоректна категорія')
      return
    }

    let mounted = true
    const isFirstPaint = !hasLoadedOnceRef.current

    ;(async () => {
      setLoadError(null)
      if (isFirstPaint) {
        setLoading(true)
        setRefreshing(false)
      } else {
        setRefreshing(true)
      }

      try {
        const [treeRaw, flat] = await Promise.all([
          publicApi.getPublicCategoryTree().catch(() => []),
          publicApi.getPublicCategories().catch(() => []),
        ])
        const tree = Array.isArray(treeRaw) ? treeRaw : []

        let ctx = findCategoryContext(tree, id)
        if (!ctx && flat.length) {
          ctx = buildContextFromFlat(flat, id)
        }
        if (!ctx) {
          setData(null)
          setLoadError('Категорію не знайдено')
          setNavRoots([])
          setResolvedSectionId(null)
          setViewKind(null)
          return
        }

        const roots = tree.length > 0 ? sortRoots(tree) : rootsFromFlat(flat)
        setNavRoots(roots)
        setResolvedSectionId(ctx.section.id)
        setViewKind(ctx.kind)

        let items
        let vm
        if (ctx.kind === 'section') {
          items = await publicApi.getPublicMenuItems({
            parent_category_id: id,
            is_available: true,
            per_page: 150,
          })
          vm = buildSectionViewModel(ctx.section, items)
        } else {
          items = await publicApi.getPublicMenuItems({
            category_id: id,
            is_available: true,
            per_page: 150,
          })
          vm = buildViewModel(ctx.sub, items)
        }

        if (!mounted) return
        setData(vm)
        hasLoadedOnceRef.current = true
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        })
      } catch (e) {
        if (!mounted) return
        if (isFirstPaint) {
          setData(null)
        }
        setLoadError(getErrorMessage(e))
      } finally {
        if (mounted) {
          setLoading(false)
          setRefreshing(false)
        }
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
  }, [categoryId])

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return
    const tabs = root.querySelectorAll('.carousel-tab')
    const el = tabs[activeSub]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeSub, data?.subcategories?.length, categoryId])

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
        rootMargin: '-200px 0px -40% 0px',
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

  if (loading && !data) {
    return (
      <div className="category-page category-page--initial">
        <div className="category-sticky-header category-sticky-header--nav-only">
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
        </div>
        <div className="category-skeleton" aria-busy="true" aria-label="Завантаження меню">
          <div className="category-skeleton__title" />
          <div className="category-skeleton__line" />
          <div className="category-skeleton__line category-skeleton__line--short" />
          {[1, 2, 3].map((k) => (
            <div key={k} className="category-skeleton__card">
              <div className="category-skeleton__card-text">
                <div className="category-skeleton__line" />
                <div className="category-skeleton__line category-skeleton__line--short" />
              </div>
              <div className="category-skeleton__thumb" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data && loadError) {
    return (
      <div className="category-page">
        <div className="error-msg">{loadError}</div>
        <Link to="/">На головну</Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="category-page">
        <div className="error-msg">Категорію не знайдено</div>
        <Link to="/">На головну</Link>
      </div>
    )
  }

  const scrollToSection = (index) => {
    setActiveSub(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`category-page ${refreshing ? 'category-page--refreshing' : ''}`}>
      <div className="category-refresh-bar" aria-hidden={!refreshing} data-active={refreshing} />

      {loadError ? (
        <div className="category-inline-error" role="alert">
          {loadError}
        </div>
      ) : null}

      <div className="category-sticky-header">
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
                {viewKind === 'sub' && resolvedSectionId != null ? (
                  <Link
                    to={`/category/${resolvedSectionId}`}
                    className="dropdown-option dropdown-option--emphasis"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Увесь розділ
                  </Link>
                ) : null}
                {navRoots
                  .filter((r) => r.id !== resolvedSectionId)
                  .map((r) => (
                    <Link
                      key={r.id}
                      to={`/category/${r.id}`}
                      className="dropdown-option"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {r.name}
                    </Link>
                  ))}
              </div>
            ) : null}
          </div>
        </div>

        {data.subcategories.length > 1 ? (
          <div
            className="subcategory-carousel"
            ref={carouselRef}
            role="tablist"
            aria-label="Підкатегорії"
          >
            {data.subcategories.map((sub, index) => (
              <button
                key={sub.id}
                type="button"
                role="tab"
                aria-selected={activeSub === index}
                className={`carousel-tab ${activeSub === index ? 'active' : ''}`}
                onClick={() => scrollToSection(index)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <main
        className={`all-dishes-list category-dishes-enter ${refreshing ? 'all-dishes-list--dimmed' : ''}`}
        key={categoryId}
      >
        {data.subcategories.map((sub, subIndex) => (
          <section
            key={sub.id}
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
            {sub.items.map((item, itemIndex) => (
              <div
                key={item.id}
                className="dish-item-card"
                style={{ '--stagger': `${Math.min(itemIndex, 12)}` }}
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
