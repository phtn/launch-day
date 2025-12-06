import { IconifyIcon, IconifyIconsResponse, IconSet } from '@/app/api/icones/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type IconEntry = { name: string; sourceSetId: string; sourceHeight: number } & IconifyIcon

const CHUNK_SIZE = 40

// Simplified for single-set usage per IconSetCard to avoid effect loops on array identity
export const useIconMeta = (iconSetId: string = 'proicons') => {
  const [metadata, setMetadata] = useState<IconSet | null>(null)
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false)

  const [icons, setIcons] = useState<IconEntry[]>([])
  const [loadingIcons, setLoadingIcons] = useState<boolean>(false)
  const [nextIndex, setNextIndex] = useState<number>(0)
  const [loadingAll, setLoadingAll] = useState<boolean>(false)

  const metaAbortRef = useRef<AbortController | null>(null)
  const iconsAbortRef = useRef<AbortController | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  // Fetch set metadata for the given id (no array dependency => no re-run due to new array identity)
  useEffect(() => {
    const controller = new AbortController()
    metaAbortRef.current?.abort()
    metaAbortRef.current = controller

    const fetchMetadata = async () => {
      try {
        setLoadingMeta(true)
        // reset icons when switching set id
        setIcons([])
        setNextIndex(0)

        const response = await fetch('/api/icones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ iconSet: iconSetId }),
          signal: controller.signal
        })

        const json = (await response.json()) as { data: IconSet }

        if (!controller.signal.aborted) {
          setMetadata(json.data)
        }
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          console.log('[useGetMeta] metadata request aborted')
          return
        }
        console.error('[useGetMeta] metadata error:', err)
      } finally {
        setLoadingMeta(false)
      }
    }

    void fetchMetadata()
    return () => controller.abort()
  }, [iconSetId])

  const doFetchIcons = useCallback(
    async (start: number) => {
      if (!metadata) return
      const id = (metadata.id ?? iconSetId).trim()
      const list = metadata.icons.slice(start, start + CHUNK_SIZE)
      if (list.length === 0) return

      // Encode as "alarm-clock%2C..." by encoding the comma-separated string with a trailing comma
      const encoded = encodeURIComponent(list.join(',') + ',')
      const url = `https://api.iconify.design/${id}.json?icons=${encoded}`

      const controller = new AbortController()
      iconsAbortRef.current?.abort()
      iconsAbortRef.current = controller

      try {
        setLoadingIcons(true)
        const res = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        })

        const payload = (await res.json()) as IconifyIconsResponse

        if (!controller.signal.aborted) {
          const entries: IconEntry[] = Object.entries(payload.icons ?? {}).map(([name, icon]) => ({
            name,
            sourceSetId: id,
            sourceHeight: metadata.height,
            ...icon
          }))
          setIcons((prev) => [...prev, ...entries])
          setNextIndex(start + list.length)
        }
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          console.log('[useGetMeta] iconify request aborted')
          return
        }
        console.error('[useGetMeta] iconify error:', err)
      } finally {
        setLoadingIcons(false)
      }
    },
    [metadata, iconSetId]
  )

  // Automatically fetch the first chunk after metadata arrives
  useEffect(() => {
    if (metadata && icons.length === 0 && !loadingIcons) {
      void doFetchIcons(0)
    }
  }, [metadata, icons.length, loadingIcons, doFetchIcons])

  const hasMore = useMemo(() => {
    if (!metadata) return false
    return nextIndex < metadata.icons.length
  }, [metadata, nextIndex])

  const loadMore = useCallback(() => {
    if (!metadata) return
    if (loadingIcons) return
    if (!hasMore) return
    scrollAreaRef.current?.scrollIntoView({ behavior: 'smooth' })
    void doFetchIcons(nextIndex)
  }, [metadata, loadingIcons, hasMore, doFetchIcons, nextIndex])

  // Load all remaining icons in sequential chunks
  const loadAll = useCallback(async () => {
    if (!metadata) return
    if (loadingIcons || loadingAll) return

    setLoadingAll(true)
    try {
      let i = nextIndex

      while (metadata && i < metadata.icons.length) {
        if (i === nextIndex) {
          // Give visual feedback on first batch
          scrollAreaRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        await doFetchIcons(i)

        // If the current in-flight request was aborted, stop the loop
        if (iconsAbortRef.current?.signal.aborted) break

        // If we've reached or are about to exceed the end, stop
        if (!metadata || i + CHUNK_SIZE >= metadata.icons.length) break

        i += CHUNK_SIZE
      }
    } finally {
      setLoadingAll(false)
    }
  }, [metadata, loadingIcons, loadingAll, nextIndex, doFetchIcons])

  return {
    metadata,
    icons,
    hasMore,
    loadMore,
    loadAll,
    loadingMeta,
    loadingIcons,
    loadingAll,
    scrollAreaRef
  }
}
