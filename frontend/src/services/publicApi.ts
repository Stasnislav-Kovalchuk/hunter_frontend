import { api } from '@/services/api'
import type { Category, MenuItem } from '@/types/menu'

type CollectionResponse<T> =
  | T[]
  | {
      items: T[]
    }
  | {
      category: unknown
      items: T[]
    }

function extractCollection<T>(data: CollectionResponse<T>): T[] {
  return Array.isArray(data) ? data : data.items
}

function normalizeImageUrl(imageUrl: MenuItem['image_url']): MenuItem['image_url'] {
  if (!imageUrl) return imageUrl
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl

  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  if (!apiBase) return imageUrl

  // Backend може віддавати відносні шляхи на кшталт `/static/uploads/...jpg`.
  // Тоді на іншому домені треба підставити базову URL бекенду.
  if (imageUrl.startsWith('/')) return `${apiBase}${imageUrl}`
  return `${apiBase}/${imageUrl}`
}

export async function getPublicCategories(): Promise<Category[]> {
  const { data } = await api.get<CollectionResponse<Category>>('/api/public/categories')
  return extractCollection(data)
}

export type MenuItemsQuery = {
  page?: number
  per_page?: number
  q?: string
  is_available?: boolean
  category_id?: number
}

export async function getPublicMenuItems(query: MenuItemsQuery = {}): Promise<MenuItem[]> {
  const { data } = await api.get<CollectionResponse<MenuItem>>('/api/public/menu-items', { params: query })
  return extractCollection(data).map((it) => ({
    ...it,
    image_url: normalizeImageUrl(it.image_url),
  }))
}

export async function getPublicMenuItemsByCategory(
  categoryId: number,
  query: Omit<MenuItemsQuery, 'category_id'> = {},
): Promise<MenuItem[]> {
  const { data } = await api.get<CollectionResponse<MenuItem>>(`/api/public/categories/${categoryId}/menu-items`, {
    params: query,
  })
  return extractCollection(data).map((it) => ({
    ...it,
    image_url: normalizeImageUrl(it.image_url),
  }))
}

