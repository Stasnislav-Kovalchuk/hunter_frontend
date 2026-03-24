import { api } from '@/services/api'
import type { Category, MenuItem } from '@/types/menu'

export async function getPublicCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/api/public/categories')
  return data
}

export type MenuItemsQuery = {
  page?: number
  per_page?: number
  q?: string
  is_available?: boolean
  category_id?: number
}

export async function getPublicMenuItems(query: MenuItemsQuery = {}): Promise<MenuItem[]> {
  const { data } = await api.get<MenuItem[]>('/api/public/menu-items', { params: query })
  return data
}

export async function getPublicMenuItemsByCategory(
  categoryId: number,
  query: Omit<MenuItemsQuery, 'category_id'> = {},
): Promise<MenuItem[]> {
  const { data } = await api.get<MenuItem[]>(`/api/public/categories/${categoryId}/menu-items`, {
    params: query,
  })
  return data
}

