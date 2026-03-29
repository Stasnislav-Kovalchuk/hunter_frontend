import type { Category, CategoryTreeNode } from '@/types/menu'

export function findCategoryContext(
  tree: CategoryTreeNode[],
  id: number,
): { kind: 'section'; section: CategoryTreeNode } | { kind: 'sub'; section: CategoryTreeNode; sub: CategoryTreeNode } | null {
  for (const root of tree) {
    if (root.id === id) return { kind: 'section', section: root }
    for (const ch of root.children ?? []) {
      if (ch.id === id) return { kind: 'sub', section: root, sub: ch }
    }
  }
  return null
}

/** Листові підкатегорії розділу (рівень 2) */
export function leafCategoryIds(section: CategoryTreeNode): number[] {
  return (section.children ?? []).map((c) => c.id)
}

/**
 * Якщо /category-tree недоступний або id не знайдено в дереві — збираємо контекст з плоского GET /categories.
 */
export function buildContextFromFlat(
  flat: Category[],
  id: number,
):
  | { kind: 'section'; section: CategoryTreeNode }
  | { kind: 'sub'; section: CategoryTreeNode; sub: CategoryTreeNode }
  | null {
  const cat = flat.find((x) => x.id === id)
  if (!cat) return null

  const sortFn = (a: Category, b: Category) => (a.sort_order ?? 0) - (b.sort_order ?? 0)

  if (cat.parent_id == null) {
    const children = flat.filter((x) => x.parent_id === id).sort(sortFn)
    const section: CategoryTreeNode = {
      ...cat,
      children: children.map((c) => ({ ...c, children: [] })),
    }
    return { kind: 'section', section }
  }

  const parent = flat.find((x) => x.id === cat.parent_id)
  if (!parent) return null

  const siblings = flat.filter((x) => x.parent_id === parent.id).sort(sortFn)
  const section: CategoryTreeNode = {
    ...parent,
    children: siblings.map((c) => ({ ...c, children: [] })),
  }
  const sub: CategoryTreeNode = { ...cat, children: [] }
  return { kind: 'sub', section, sub }
}

export function sortRoots(roots: CategoryTreeNode[]): CategoryTreeNode[] {
  return [...roots].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

const bySort = (a: Category, b: Category) => (a.sort_order ?? 0) - (b.sort_order ?? 0)

/** Якщо category-tree порожній — збираємо 2 рівні з плоского списку */
export function rootsFromFlat(flat: Category[]): CategoryTreeNode[] {
  const roots = flat.filter((c) => c.parent_id == null).sort(bySort)
  return roots.map((r) => ({
    ...r,
    children: flat.filter((c) => c.parent_id === r.id).sort(bySort).map((c) => ({ ...c, children: [] })),
  }))
}
