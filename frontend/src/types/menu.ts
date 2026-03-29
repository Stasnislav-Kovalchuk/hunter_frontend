export type Category = {
  id: number
  name: string
  description?: string | null
  /** null — розділ верхнього рівня; число — підкатегорія */
  parent_id?: number | null
  is_active?: boolean
  sort_order?: number
}

/** Вузол з GET /api/public/category-tree (2 рівні: розділ → children) */
export type CategoryTreeNode = Category & {
  children?: CategoryTreeNode[]
}

export type MenuItem = {
  id: number
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  is_available: boolean
  is_featured?: boolean
  sort_order?: number
  ingredients?: string | null
  allergens?: string | null
  calories_kcal?: number | null
  weight_g?: number | null
  prep_time_minutes?: number | null
  category_id: number | null
  category_name?: string
}

