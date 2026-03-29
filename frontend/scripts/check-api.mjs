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

const sample = categories[0]
if (!('parent_id' in sample)) {
  console.warn('У категорії немає поля parent_id — потрібен оновлений бекенд (2 рівні категорій).')
}

// 1b) Дерево розділів (новий ендпоїнт)
try {
  const treeResp = await fetchJson(`${baseArg}/api/public/category-tree`)
  const tree = ensureArray(treeResp.json, 'GET /api/public/category-tree має повертати JSON-масив')
  console.log(`--- OK category-tree roots: ${tree.length}`)
} catch (e) {
  console.warn('--- SKIP category-tree:', e instanceof Error ? e.message : e)
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

// 3) Розділ: глибокий список (розділ + підкатегорії) — category_id у товарів може бути id листка
const rootCat = categories.find((c) => c.parent_id == null) ?? categories[0]
const sectionId = Number(rootCat?.id)
if (!Number.isFinite(sectionId)) throw new Error('Немає коректного id розділу')

const deepUrl = `${baseArg}/api/public/categories/${sectionId}/menu-items?is_available=true&per_page=50`
const deepResp = await fetchJson(deepUrl)
const deepItems = deepResp.json?.items
if (!Array.isArray(deepItems)) {
  throw new Error('GET /api/public/categories/<id>/menu-items має повертати { items: [...] }')
}
console.log(`--- OK deep menu-items for section ${sectionId}: ${deepItems.length}`)

// 3b) Листок: shallow=true — усі товари з точним category_id
const leafCat = categories.find((c) => c.parent_id != null)
if (leafCat) {
  const leafId = Number(leafCat.id)
  const shallowUrl = `${baseArg}/api/public/categories/${leafId}/menu-items?shallow=true&is_available=true&per_page=50`
  const shallowResp = await fetchJson(shallowUrl)
  const shallowItems = shallowResp.json?.items
  if (!Array.isArray(shallowItems)) throw new Error('shallow menu-items: очікували { items: [...] }')
  console.log(`--- OK shallow menu-items for leaf ${leafId}: ${shallowItems.length}`)
  for (const it of shallowItems.slice(0, 50)) {
    if (it?.category_id != null && Number(it.category_id) !== leafId) {
      console.error('При shallow=true category_id має збігатися з id листка:', {
        leafId,
        itemId: it?.id,
        itemCategoryId: it?.category_id,
      })
      process.exit(1)
    }
  }
} else {
  console.warn('Немає підкатегорій у flat categories — пропуск перевірки shallow.')
}

// 3c) parent_category_id (меню всього розділу одним запитом)
try {
  const parentUrl = `${baseArg}/api/public/menu-items?parent_category_id=${sectionId}&is_available=true&per_page=50`
  const parentResp = await fetchJson(parentUrl)
  const parentItems = parentResp.json?.items
  if (!Array.isArray(parentItems)) throw new Error('expected items[]')
  console.log(`--- OK menu-items?parent_category_id=${sectionId}: ${parentItems.length}`)
} catch (e) {
  console.warn('--- SKIP parent_category_id:', e instanceof Error ? e.message : e)
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
