import type { IconifyIconsResponse, IconSet } from '@/app/api/icones/types'
import { normalizeIconifyIcon } from '@/lib/iconify'
import type { IconEntry } from './use-icon-meta'

/**
 * In-memory cache for icon metadata and icons.
 * Persists across component mounts for instant navigation.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface IconCache {
  metadata: Map<string, CacheEntry<IconSet>>
  icons: Map<string, CacheEntry<IconEntry[]>>
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Module-level cache - survives HMR and component remounts
const cache: IconCache = {
  metadata: new Map(),
  icons: new Map()
}

// Pending fetch promises to prevent duplicate requests
const pendingMetadata = new Map<string, Promise<IconSet | null>>()
const pendingIcons = new Map<string, Promise<IconEntry[]>>()

function isExpired<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return true
  return Date.now() - entry.timestamp > CACHE_TTL
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA CACHE
// ─────────────────────────────────────────────────────────────────────────────

export function getCachedMetadata(iconSetId: string): IconSet | null {
  const entry = cache.metadata.get(iconSetId)
  if (!entry || isExpired(entry)) return null
  return entry.data
}

export function setCachedMetadata(iconSetId: string, data: IconSet): void {
  cache.metadata.set(iconSetId, { data, timestamp: Date.now() })
}

export async function fetchAndCacheMetadata(iconSetId: string): Promise<IconSet | null> {
  // Return cached if fresh
  const cached = getCachedMetadata(iconSetId)
  if (cached) return cached

  // Return pending promise if in-flight (deduplication)
  const pending = pendingMetadata.get(iconSetId)
  if (pending) return pending

  // Create new fetch promise (no abort signal - cache layer is independent of component lifecycle)
  const fetchPromise = (async (): Promise<IconSet | null> => {
    try {
      const response = await fetch('/api/icones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ iconSet: iconSetId })
      })

      const json = (await response.json()) as { data: IconSet }
      setCachedMetadata(iconSetId, json.data)
      return json.data
    } catch (err) {
      console.error('[icon-cache] metadata fetch error:', err)
      return null
    } finally {
      pendingMetadata.delete(iconSetId)
    }
  })()

  pendingMetadata.set(iconSetId, fetchPromise)
  return fetchPromise
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS CACHE
// ─────────────────────────────────────────────────────────────────────────────

export function getCachedIcons(iconSetId: string): IconEntry[] | null {
  const entry = cache.icons.get(iconSetId)
  if (!entry || isExpired(entry)) return null
  return entry.data
}

export function setCachedIcons(iconSetId: string, data: IconEntry[]): void {
  cache.icons.set(iconSetId, { data, timestamp: Date.now() })
}

export function appendCachedIcons(iconSetId: string, newIcons: IconEntry[]): void {
  const existing = getCachedIcons(iconSetId) ?? []
  const merged = [...existing, ...newIcons]
  setCachedIcons(iconSetId, merged)
}

// ─────────────────────────────────────────────────────────────────────────────
// PREFETCH UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 240

/**
 * Prefetch metadata and initial icons for an icon set.
 * Safe to call multiple times - will use cache/pending requests.
 */
export async function prefetchIconSet(iconSetId: string, length = CHUNK_SIZE): Promise<void> {
  // Fetch metadata first
  const metadata = await fetchAndCacheMetadata(iconSetId)
  if (!metadata) return

  // Check if we already have icons cached
  const cached = getCachedIcons(iconSetId)
  if (cached && cached.length > 0) return

  // Check if already fetching
  const pendingKey = `${iconSetId}:initial`
  if (pendingIcons.has(pendingKey)) return

  // Fetch first chunk of icons
  const fetchPromise = (async (): Promise<IconEntry[]> => {
    try {
      const id = (metadata.id ?? iconSetId).trim()
      const list = metadata.icons.slice(0, length)
      if (list.length === 0) return []

      const encoded = encodeURIComponent(list.join(',') + ',')
      const url = `https://api.iconify.design/${id}.json?icons=${encoded}`

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })

      const payload = (await res.json()) as IconifyIconsResponse

      const iconDefaults = {
        left: payload.left,
        top: payload.top,
        width: payload.width,
        height: payload.height
      }

      const entries: IconEntry[] = Object.entries(payload.icons ?? {}).map(([name, icon]) => ({
        name,
        sourceSetId: id,
        sourceHeight: metadata.height,
        ...normalizeIconifyIcon(icon, iconDefaults, metadata.height)
      }))

      setCachedIcons(iconSetId, entries)
      return entries
    } catch (err) {
      console.error('[icon-cache] icons prefetch error:', err)
      return []
    } finally {
      pendingIcons.delete(pendingKey)
    }
  })()

  pendingIcons.set(pendingKey, fetchPromise)
  await fetchPromise
}

/**
 * Clear all caches (useful for testing/debugging)
 */
export function clearIconCache(): void {
  cache.metadata.clear()
  cache.icons.clear()
}
