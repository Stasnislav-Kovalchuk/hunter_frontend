import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CategoryTreeNode, MenuItem } from '@/types/menu'
import * as publicApi from '@/services/publicApi'
import { getErrorMessage } from '@/services/api'
import { leafCategoryIds, rootsFromFlat, sortRoots } from '@/utils/categoryTree'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

function formatPrice(price: number) {
  try {
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(price)
  } catch {
    return `${price} ₴`
  }
}

function ProductCard({ item }: { item: MenuItem }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-zinc-100">
      <div className="aspect-[4/3] w-full bg-zinc-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">Без фото</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-900">{item.name}</div>
            {item.description ? <div className="mt-1 line-clamp-2 text-xs text-zinc-600">{item.description}</div> : null}
          </div>
          <div className="shrink-0 rounded-xl bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
            {formatPrice(item.price)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const { restaurantId } = useParams()
  /** Розділи верхнього рівня (фільтр «Усе» + по розділу) */
  const [sections, setSections] = useState<CategoryTreeNode[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [q, setQ] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [tree, flat, menuItems] = await Promise.all([
          publicApi.getPublicCategoryTree().catch(() => []),
          publicApi.getPublicCategories().catch(() => []),
          publicApi.getPublicMenuItems({ is_available: true, per_page: 200 }),
        ])
        if (!mounted) return
        const roots = tree.length > 0 ? sortRoots(tree) : rootsFromFlat(flat)
        setSections(roots)
        setItems(menuItems)
      } catch (e) {
        if (!mounted) return
        setError(getErrorMessage(e))
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [restaurantId])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const section =
      activeCategoryId != null ? sections.find((s) => s.id === activeCategoryId) : undefined

    return items.filter((it) => {
      if (!it.is_available) return false
      if (activeCategoryId != null) {
        if (!section) return false
        const leaves = leafCategoryIds(section)
        if (leaves.length === 0) return false
        const allowed = new Set(leaves)
        if (it.category_id == null || !allowed.has(it.category_id)) return false
      }
      if (!query) return true
      const hay = `${it.name} ${it.description ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [items, activeCategoryId, q, sections])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Spinner label="Завантажуємо меню…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <EmptyState
          title="Не вдалося завантажити меню"
          description={error}
          action={
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Спробувати ще раз
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500">Ресторан</div>
          <div className="text-lg font-semibold tracking-tight">Меню #{restaurantId}</div>
        </div>
      </div>

      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Пошук…"
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900/20"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={[
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition',
            activeCategoryId === null ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-900 ring-zinc-200',
          ].join(' ')}
        >
          Усе
        </button>
        {sections.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategoryId(c.id)}
            className={[
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition',
              activeCategoryId === c.id ? 'bg-zinc-900 text-white ring-zinc-900' : 'bg-white text-zinc-900 ring-zinc-200',
            ].join(' ')}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Нічого не знайдено" description="Спробуйте змінити фільтр або пошуковий запит." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((it) => (
            <ProductCard key={it.id} item={it} />
          ))}
        </div>
      )}

      <div className="mt-10 pb-4 text-center text-xs text-zinc-500">
        API: <span className="font-mono">{import.meta.env.VITE_API_URL}</span>
      </div>
    </div>
  )
}

