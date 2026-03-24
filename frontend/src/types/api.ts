export type ApiErrorShape = {
  message?: string
  error?: string
  msg?: string
}

export type Paginated<T> = {
  items: T[]
  page: number
  per_page: number
  total: number
  pages: number
}

