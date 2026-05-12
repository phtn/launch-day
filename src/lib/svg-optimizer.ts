import { optimize, type Config, type CustomPlugin } from 'svgo'

const DEFAULT_TARGET_HEIGHT = 42
const DEFAULT_FLOAT_PRECISION = 3

export interface OptimizeSvgOptions {
  bakeNormalizedGeometry?: boolean
  floatPrecision?: number
  multipass?: boolean
  normalizeViewBox?: boolean
  pathFillsCurrentColor?: boolean
  targetHeight?: number
}

export interface OptimizeSvgStats {
  bytesSaved: number
  optimizedBytes: number
  originalBytes: number
  percentSaved: number
}

export interface OptimizeSvgViewBox {
  normalized: boolean
  optimized: string | null
  original: string | null
  targetHeight: number | null
}

export interface OptimizeSvgResult {
  data: string
  stats: OptimizeSvgStats
  viewBox: OptimizeSvgViewBox
}

interface ParsedViewBox {
  height: number
  minX: number
  minY: number
  width: number
}

interface NormalizeViewBoxPluginParams {
  bakeGeometry: boolean
  enabled: boolean
  precision: number
  targetHeight: number
}

interface CleanupSvgAttributesPluginParams {
  pathFillsCurrentColor: boolean
  precision: number
}

const normalizeViewBoxPlugin: CustomPlugin<NormalizeViewBoxPluginParams> = {
  name: 'normalizeViewBox',
  fn: (_root, params) => {
    const scaleStack: number[] = []

    return {
      element: {
        enter: (node) => {
          if (node.name === 'svg') {
            if (!params.enabled) {
              scaleStack.push(1)
              return
            }

            const parsed = parseViewBox(node.attributes.viewBox)
            if (!parsed || parsed.height <= 0 || params.targetHeight <= 0) {
              scaleStack.push(1)
              return
            }

            const scale = params.targetHeight / parsed.height
            scaleStack.push(params.bakeGeometry ? scale : 1)
            node.attributes.viewBox = formatViewBox(
              {
                minX: parsed.minX * scale,
                minY: parsed.minY * scale,
                width: parsed.width * scale,
                height: params.targetHeight
              },
              params.precision
            )

            delete node.attributes.width
            delete node.attributes.height

            if (!params.bakeGeometry && scale !== 1) {
              wrapSvgChildrenWithScale(node, scale, params.precision)
            }

            return
          }

          const scale = scaleStack[scaleStack.length - 1] ?? 1
          if (scale === 1 || node.name !== 'path') return

          node.attributes.transform = node.attributes.transform
            ? `scale(${formatNumber(scale, params.precision)}) ${node.attributes.transform}`
            : `scale(${formatNumber(scale, params.precision)})`
        },
        exit: (node) => {
          if (node.name === 'svg') {
            scaleStack.pop()
          }
        }
      }
    }
  }
}

const cleanupSvgAttributesPlugin: CustomPlugin<CleanupSvgAttributesPluginParams> = {
  name: 'cleanupSvgAttributes',
  fn: (_root, params) => ({
    element: {
      enter: (node) => {
        delete node.attributes['xml:space']
        delete node.attributes.style
        delete node.attributes.class
        delete node.attributes.id

        const translatedX = parsePositionAttribute(node.attributes.x)
        const translatedY = parsePositionAttribute(node.attributes.y)

        if (translatedX !== null || translatedY !== null) {
          const nextTransform = buildTranslateTransform(translatedX ?? 0, translatedY ?? 0, params.precision)
          if (nextTransform) {
            node.attributes.transform = node.attributes.transform
              ? `${nextTransform} ${node.attributes.transform}`
              : nextTransform
          }
        }

        delete node.attributes.x
        delete node.attributes.y

        if (!params.pathFillsCurrentColor || node.name !== 'path') return

        if (node.attributes.fill === 'none') return

        node.attributes.fill = 'currentColor'
      }
    }
  })
}

export function optimizeSvg(svg: string, options: OptimizeSvgOptions = {}): OptimizeSvgResult {
  const source = svg.trim()

  if (!source) {
    throw new Error('SVG input is empty')
  }

  if (options.normalizeViewBox === true && options.bakeNormalizedGeometry !== true) {
    const autoResult = optimizeSvgWithMode(source, options, false)
    const bakedResult = optimizeSvgWithMode(source, options, true)

    return autoResult.stats.optimizedBytes <= bakedResult.stats.optimizedBytes ? autoResult : bakedResult
  }

  return optimizeSvgWithMode(source, options, options.bakeNormalizedGeometry ?? false)
}

function optimizeSvgWithMode(
  source: string,
  options: OptimizeSvgOptions,
  bakeNormalizedGeometry: boolean
): OptimizeSvgResult {
  const floatPrecision = sanitizeFloatPrecision(options.floatPrecision)
  const normalizeViewBox = options.normalizeViewBox ?? false
  const pathFillsCurrentColor = options.pathFillsCurrentColor ?? true
  const targetHeight = sanitizeTargetHeight(options.targetHeight)
  const originalViewBox = getRootViewBox(source)
  const plugins: NonNullable<Config['plugins']> = [
    {
      name: 'preset-default'
    },
    'convertStyleToAttrs',
    'removeStyleElement',
    'removeDimensions',
    'removeScripts',
    {
      ...cleanupSvgAttributesPlugin,
      params: {
        pathFillsCurrentColor,
        precision: floatPrecision
      }
    },
    {
      ...normalizeViewBoxPlugin,
      params: {
        bakeGeometry: bakeNormalizedGeometry,
        enabled: normalizeViewBox,
        precision: floatPrecision,
        targetHeight
      }
    }
  ]

  if (normalizeViewBox && bakeNormalizedGeometry) {
    plugins.splice(2, 0, {
      name: 'convertShapeToPath',
      params: {
        convertArcs: true,
        floatPrecision
      }
    })

    plugins.push({
      name: 'convertPathData',
      params: {
        applyTransforms: true,
        applyTransformsStroked: true,
        floatPrecision
      }
    })
  }

  const config: Config = {
    path: 'inline.svg',
    multipass: options.multipass ?? false,
    floatPrecision,
    js2svg: {
      pretty: false
    },
    plugins
  }

  const result = optimize(source, config)
  const optimizedViewBox = getRootViewBox(result.data)
  const originalBytes = getByteLength(source)
  const optimizedBytes = getByteLength(result.data)
  const bytesSaved = Math.max(originalBytes - optimizedBytes, 0)
  const percentSaved = originalBytes > 0 ? Number(((bytesSaved / originalBytes) * 100).toFixed(2)) : 0

  return {
    data: result.data,
    stats: {
      bytesSaved,
      optimizedBytes,
      originalBytes,
      percentSaved
    },
    viewBox: {
      normalized: normalizeViewBox && originalViewBox !== optimizedViewBox,
      optimized: optimizedViewBox,
      original: originalViewBox,
      targetHeight: normalizeViewBox ? targetHeight : null
    }
  }
}

function getByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

function getRootViewBox(svg: string): string | null {
  const match = svg.match(/<svg\b[^>]*\bviewBox=(['"])(.*?)\1/i)
  return match?.[2] ?? null
}

function parseViewBox(value?: string | null): ParsedViewBox | null {
  if (!value) return null

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((entry) => Number(entry))

  if (parts.length !== 4 || parts.some((entry) => !Number.isFinite(entry))) {
    return null
  }

  return {
    minX: parts[0]!,
    minY: parts[1]!,
    width: parts[2]!,
    height: parts[3]!
  }
}

function formatViewBox(viewBox: ParsedViewBox, precision: number): string {
  return [
    formatNumber(viewBox.minX, precision),
    formatNumber(viewBox.minY, precision),
    formatNumber(viewBox.width, precision),
    formatNumber(viewBox.height, precision)
  ].join(' ')
}

function formatNumber(value: number, precision: number): string {
  const rounded = Number(value.toFixed(precision))
  return `${Object.is(rounded, -0) ? 0 : rounded}`
}

function buildTranslateTransform(x: number, y: number, precision: number): string | null {
  if (x === 0 && y === 0) return null

  return y === 0
    ? `translate(${formatNumber(x, precision)})`
    : `translate(${formatNumber(x, precision)} ${formatNumber(y, precision)})`
}

function parsePositionAttribute(value?: string): number | null {
  if (value == null) return null

  const normalized = value.trim()
  if (!normalized) return null

  if (normalized.endsWith('%')) return null

  const match = normalized.match(/^([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)(?:px)?$/)
  if (!match) return null

  const numeric = Number(match[1])
  return Number.isFinite(numeric) ? numeric : null
}

function wrapSvgChildrenWithScale(
  svgNode: {
    children: Array<{
      type: string
      name?: string
      attributes?: Record<string, string>
      children?: unknown[]
    }>
  },
  scale: number,
  precision: number
): void {
  const scalableChildren = svgNode.children.filter((child) => isScalableSvgChild(child))
  if (scalableChildren.length === 0) return

  const staticChildren = svgNode.children.filter((child) => !isScalableSvgChild(child))
  svgNode.children = [
    ...staticChildren,
    {
      type: 'element',
      name: 'g',
      attributes: {
        transform: `scale(${formatNumber(scale, precision)})`
      },
      children: scalableChildren
    }
  ]
}

function isScalableSvgChild(child: { type: string; name?: string }): boolean {
  if (child.type !== 'element') return true

  return !NON_SCALABLE_SVG_CHILDREN.has(child.name ?? '')
}

const NON_SCALABLE_SVG_CHILDREN = new Set(['defs', 'desc', 'metadata', 'script', 'style', 'title'])

function sanitizeFloatPrecision(value?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return DEFAULT_FLOAT_PRECISION
  }

  return Math.min(Math.round(value), 10)
}

function sanitizeTargetHeight(value?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_TARGET_HEIGHT
  }

  return Number(value)
}
