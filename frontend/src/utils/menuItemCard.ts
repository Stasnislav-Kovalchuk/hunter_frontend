import type { MenuItem } from '@/types/menu'

/** Формат, який очікує існуюча верстка CategoryPage / SearchPage */
export type LegacyDishCard = {
  id: number
  name: string
  price: number
  desc: string
  weight: string
  image?: string | null
}

export function menuItemToLegacyCard(item: MenuItem): LegacyDishCard {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    desc: item.description ?? '',
    weight: item.weight_g != null ? `${item.weight_g} г` : '',
    image: item.image_url,
  }
}
