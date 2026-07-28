const storageKey = "oyo-properties-favorites"

export function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]
  } catch {
    return []
  }
}

export function toggleFavorite(id: string) {
  const ids = getFavoriteIds()
  const next = ids.includes(id) ? ids.filter((favoriteId) => favoriteId !== id) : [...ids, id]
  localStorage.setItem(storageKey, JSON.stringify(next))
  return next.includes(id)
}
