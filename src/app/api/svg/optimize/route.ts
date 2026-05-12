import { optimizeSvg, type OptimizeSvgOptions } from '@/lib/svg-optimizer'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface OptimizeSvgRequest {
  options?: OptimizeSvgOptions
  svg?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OptimizeSvgRequest

    if (!body.svg?.trim()) {
      return NextResponse.json({ error: 'SVG input is required' }, { status: 400 })
    }

    const result = optimizeSvg(body.svg, body.options)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize SVG'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
