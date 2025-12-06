import { NextResponse } from 'next/server'

const BASE_URL = 'https://icones.js.org'

type IconMetaResponse = unknown

async function fetchIconMeta(iconSetParam: string) {
  const iconSet = (iconSetParam || 'proicons').trim()
  const url = `${BASE_URL}/collections/${iconSet}-meta.json`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 }
  })
  return { res, url }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { iconSet?: string }
    const iconSet = body?.iconSet ?? 'proicons'
    const { res } = await fetchIconMeta(iconSet)

    // console.log("[/api/icones][POST] upstream:", url, "status:", res.status);

    const payload = (await res.json()) as IconMetaResponse
    // console.log("[/api/icones][POST] payload type:", typeof payload);

    return NextResponse.json({ data: payload }, { status: res.ok ? 200 : res.status })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[/api/icones][POST] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const iconSet = searchParams.get('iconSet') ?? 'proicons'

    const { res } = await fetchIconMeta(iconSet)
    // console.log("[/api/icones][GET] upstream:", url, "status:", res.status);

    const payload = (await res.json()) as IconMetaResponse
    // console.log("[/api/icones][GET] payload type:", typeof payload);

    return NextResponse.json({ data: payload }, { status: res.ok ? 200 : res.status })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[/api/icones][GET] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
