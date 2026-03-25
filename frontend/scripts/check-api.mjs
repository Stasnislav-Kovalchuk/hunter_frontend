/**
 * Перевірка публічних ендпойнтів бекенду (без фронта).
 *
 * Використання:
 *   node scripts/check-api.mjs
 *   node scripts/check-api.mjs http://127.0.0.1:5000
 *   node scripts/check-api.mjs https://твій-backend.up.railway.app
 */

const baseArg = process.argv[2]?.replace(/\/$/, '') || 'http://127.0.0.1:5000'

const timeoutMs = Number(process.env.API_CHECK_TIMEOUT_MS || 8000)

async function fetchJson(url) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const text = await res.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      // ignore JSON parse errors; we will print raw text below
    }

    if (!res.ok) {
      const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
      throw new Error(`HTTP ${res.status} for ${url}\n${preview}`)
    }
    return { res, json, rawText: text }
  } finally {
    clearTimeout(t)
  }
}

function ensureArray(value, msg) {
  if (!Array.isArray(value)) throw new Error(msg)
  return value
}

console.log('Base URL:', baseArg)
console.log('')

// 1) Категорії
const categoriesUrl = `${baseArg}/api/public/categories`
const categoriesResp = await fetchJson(categoriesUrl)
const categories = ensureArray(categoriesResp.json, 'GET /api/public/categories має повертати JSON-масив')
console.log(`--- OK categories: ${categories.length}`)
if (categories.length === 0) {
  console.error('Категорії порожні. Front показуватиме порожні сторінки.')
  process.exit(1)
}

// 2) Меню (пагінація)
const menuUrl = `${baseArg}/api/public/menu-items?is_available=true&per_page=20`
const menuResp = await fetchJson(menuUrl)
const menuItems = menuResp.json?.items
if (!Array.isArray(menuItems)) {
  throw new Error('GET /api/public/menu-items має повертати { items: [...] }')
}
console.log(`--- OK menu-items: ${menuItems.length}`)
if (menuItems.length === 0) {
  console.error('Страви порожні. Перевір is_available і наповнення БД.')
  process.exit(1)
}

// 3) Перевір категорію: /categories/<id>/menu-items
const categoryId = Number(categories[0]?.id)
if (!Number.isFinite(categoryId)) throw new Error('У категорії немає коректного id')

const byCatUrl = `${baseArg}/api/public/categories/${categoryId}/menu-items?is_available=true&per_page=50`
const byCatResp = await fetchJson(byCatUrl)
const itemsByCat = byCatResp.json?.items
if (!Array.isArray(itemsByCat)) throw new Error('GET /api/public/categories/<id>/menu-items має повертати { items: [...] }')

console.log(`--- OK items in category ${categoryId}: ${itemsByCat.length}`)
// Front очікує, що items належать цій категорії; якщо в items є category_id — він має збігатися.
for (const it of itemsByCat.slice(0, 50)) {
  if (it?.category_id != null && Number(it.category_id) !== categoryId) {
    console.error('Несумісність category_id для items у категорії:')
    console.error({ categoryId, itemId: it?.id, itemCategoryId: it?.category_id })
    process.exit(1)
  }
}

// 4) Пошук q=... має давати хоч щось
const query = String(menuItems[0]?.name || '').split(' ').filter(Boolean)[0] || String(menuItems[0]?.name || '')
const q = encodeURIComponent(query)
const searchUrl = `${baseArg}/api/public/menu-items?is_available=true&per_page=5&q=${q}`
const searchResp = await fetchJson(searchUrl)
const searchItems = searchResp.json?.items
if (!Array.isArray(searchItems)) throw new Error('Пошук: очікували { items: [...] }')
console.log(`--- OK search query "${query}": ${searchItems.length}`)
if (searchItems.length === 0) {
  console.error('Пошук не повертає результатів. Перевір поле name/description у БД.')
  process.exit(1)
}

// 5) Image URL: відносний чи абсолютний
const firstImage = menuItems.find((x) => x?.image_url)?.image_url
if (firstImage) {
  const isAbs = String(firstImage).startsWith('http://') || String(firstImage).startsWith('https://')
  const isRel = String(firstImage).startsWith('/')
  console.log(`--- OK image_url format: ${isAbs ? 'absolute' : isRel ? 'relative' : 'unknown'} (${firstImage})`)
} else {
  console.warn('У menu-items немає image_url. Це нормально, якщо фото не заповнювалися.')
}

console.log('')
console.log('ALL GOOD ✅')
