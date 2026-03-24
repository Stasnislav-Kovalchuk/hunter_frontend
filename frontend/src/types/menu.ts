export type Category = {
  id: number
  name: string
  description?: string | null
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
  category_id: number
  category_name?: string
}

