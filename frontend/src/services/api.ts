import axios, { AxiosError } from 'axios'
import type { ApiErrorShape } from '@/types/api'

const baseURL =
  import.meta.env.DEV
    ? '' // dev: використовуємо Vite proxy для /api → без CORS
    : import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL,
})

export function getErrorMessage(err: unknown): string {
  if (!err) return 'Невідома помилка'
  if (typeof err === 'string') return err

  if (axios.isAxiosError<ApiErrorShape>(err)) {
    const data = err.response?.data
    return (
      data?.message ||
      data?.error ||
      data?.msg ||
      err.response?.statusText ||
      err.message ||
      'Помилка запиту'
    )
  }

  if (err instanceof Error) return err.message
  return 'Помилка'
}

