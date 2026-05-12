'use client'

import { useCopy } from '@/hooks/use-copy'
import { Icon } from '@/lib/icons'
import type { OptimizeSvgOptions, OptimizeSvgResult } from '@/lib/svg-optimizer'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

const DEFAULT_TARGET_HEIGHT = 42
const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M9.438 31.401a7 7 0 0 1-1.656-1.536a20 20 0 0 1-1.422-1.938a18.9 18.9 0 0 1-2.375-4.849c-.667-2-.99-3.917-.99-5.792c0-2.094.453-3.922 1.339-5.458a7.7 7.7 0 0 1 2.797-2.906a7.45 7.45 0 0 1 3.786-1.12q.705.002 1.51.198c.385.109.854.281 1.427.495c.729.281 1.13.453 1.266.495c.427.156.786.224 1.068.224c.214 0 .516-.068.859-.172c.193-.068.557-.188 1.078-.411c.516-.188.922-.349 1.245-.469c.495-.146.974-.281 1.401-.349a6.7 6.7 0 0 1 1.531-.063a9 9 0 0 1 2.589.557c1.359.547 2.458 1.401 3.276 2.615a6.4 6.4 0 0 0-.969.734a8.2 8.2 0 0 0-1.641 2.005a6.8 6.8 0 0 0-.859 3.359c.021 1.443.391 2.714 1.12 3.813a7.2 7.2 0 0 0 2.047 2.047c.417.281.776.474 1.12.604c-.161.5-.333.984-.536 1.464a19 19 0 0 1-1.667 3.083c-.578.839-1.031 1.464-1.375 1.88c-.536.635-1.052 1.12-1.573 1.458c-.573.38-1.25.583-1.938.583a4.4 4.4 0 0 1-1.38-.167c-.385-.13-.766-.271-1.141-.432a9 9 0 0 0-1.203-.453a6.3 6.3 0 0 0-3.099-.005c-.417.12-.818.26-1.214.432c-.557.234-.927.391-1.141.458c-.427.125-.87.203-1.318.229c-.693 0-1.339-.198-1.979-.599zm9.14-24.615c-.906.453-1.771.646-2.63.583c-.135-.865 0-1.75.359-2.719a7.3 7.3 0 0 1 1.333-2.24A7.1 7.1 0 0 1 19.812.733q1.319-.68 2.521-.734c.104.906 0 1.797-.333 2.76a8 8 0 0 1-1.333 2.344a6.8 6.8 0 0 1-2.115 1.682z"/></svg>`

interface OptimizeSvgResponse extends OptimizeSvgResult {
  error?: string
}

export const Content = () => {
  const [bakeNormalizedGeometry, setBakeNormalizedGeometry] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fileName, setFileName] = useState('optimized.svg')
  const [normalizeViewBox, setNormalizeViewBox] = useState(false)
  const [pathFillsCurrentColor, setPathFillsCurrentColor] = useState(true)
  const [targetHeight, setTargetHeight] = useState(DEFAULT_TARGET_HEIGHT)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OptimizeSvgResult | null>(null)
  const [hasOptimized, setHasOptimized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const latestInputRef = useRef('')
  const { copy, isCopied } = useCopy({})

  useEffect(() => {
    latestInputRef.current = input
  }, [input])

  const previewSrc = useMemo(() => {
    if (!output) return ''
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`
  }, [output])

  const optimizeValue = useCallback(
    async (svg: string) => {
      const source = svg.trim()

      if (!source) {
        setOutput('')
        setResult(null)
        setError(null)
        setHasOptimized(false)
        return
      }

      setIsOptimizing(true)
      setError(null)

      try {
        const options: OptimizeSvgOptions = {
          bakeNormalizedGeometry,
          normalizeViewBox,
          pathFillsCurrentColor,
          targetHeight
        }

        const res = await fetch('/api/svg/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            svg: source,
            options
          })
        })

        const payload = (await res.json()) as OptimizeSvgResponse

        if (!res.ok || payload.error) {
          throw new Error(payload.error ?? 'Failed to optimize SVG')
        }

        setOutput(payload.data)
        setResult(payload)
        setHasOptimized(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to optimize SVG'
        setError(message)
        setOutput('')
        setResult(null)
      } finally {
        setIsOptimizing(false)
      }
    },
    [bakeNormalizedGeometry, normalizeViewBox, pathFillsCurrentColor, targetHeight]
  )

  useEffect(() => {
    if (!hasOptimized || !latestInputRef.current.trim()) return
    void optimizeValue(latestInputRef.current)
  }, [hasOptimized, optimizeValue])

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleOptimize = useCallback(() => {
    void optimizeValue(input)
  }, [input, optimizeValue])

  const handleCopy = useCallback(() => {
    if (!output) return
    void copy('optimized-svg', output)
  }, [copy, output])

  const handleDownload = useCallback(() => {
    if (!output) return

    const blob = new Blob([output], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [fileName, output])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      setFileName('pasted.svg')
      void optimizeValue(text)
    } catch {
      setError('Clipboard access was denied')
    }
  }, [optimizeValue])

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const text = await file.text()
      const nextName = file.name.replace(/\.svg$/i, '.optimized.svg')
      setInput(text)
      setFileName(nextName)
      setError(null)
      void optimizeValue(text)

      event.target.value = ''
    },
    [optimizeValue]
  )

  const handleTargetHeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    setTargetHeight(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : DEFAULT_TARGET_HEIGHT)
  }, [])

  return (
    <main className='md:mt-12 flex min-h-[calc(100vh-5rem)] flex-col text-white'>
      <div className='flex items-center justify-between border-b border-base-300/80 bg-base-100/70 px-4 py-3 backdrop-blur xl:px-6'>
        <div className='flex items-center gap-3'>
          <Link href='/icons' className='btn btn-ghost btn-sm rounded-lg px-2'>
            <Icon name='arrow-left-02' className='size-4' />
          </Link>
          <div>
            <h1 className='text-lg font-semibold tracking-tight'>SVG Optimizer</h1>
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <button type='button' onClick={handleBrowse} className='btn btn-soft btn-sm rounded-lg'>
            <Icon name='image-upload' className='size-4' />
            <span>Open SVG</span>
          </button>
          <button type='button' onClick={handlePaste} className='btn btn-soft btn-sm rounded-lg'>
            <Icon name='clipboard' className='size-4 opacity-70' />
            <span>Paste</span>
          </button>
          <button
            type='button'
            onClick={handleOptimize}
            disabled={isOptimizing || !input.trim()}
            className='btn btn-sm rounded-lg bg-minty text-base-300 hover:bg-minty/90 disabled:bg-base-300 disabled:text-base-content/50'>
            <Icon name={isOptimizing ? 'spinner-ring' : 'hot'} className='size-4' />
            <span>Optimize</span>
          </button>
        </div>
      </div>

      <div className='border-b border-base-300/80 bg-base-100 px-4 py-3 xl:px-6'>
        <div className='flex flex-wrap items-center gap-4'>
          <label className='flex items-center gap-2 text-sm text-base-content/80'>
            <input
              type='checkbox'
              checked={normalizeViewBox}
              onChange={(event) => setNormalizeViewBox(event.target.checked)}
              className='checkbox checkbox-xs rounded-sm'
            />
            <span>Normalize viewBox</span>
          </label>

          <label className='flex items-center gap-2 text-sm text-base-content/80'>
            <input
              type='checkbox'
              checked={bakeNormalizedGeometry}
              onChange={(event) => setBakeNormalizedGeometry(event.target.checked)}
              disabled={!normalizeViewBox}
              className='checkbox checkbox-xs rounded-sm disabled:opacity-50'
            />
            <span>Baked Path</span>
          </label>

          <label className='flex items-center gap-2 text-sm text-base-content/80'>
            <input
              type='checkbox'
              checked={pathFillsCurrentColor}
              onChange={(event) => setPathFillsCurrentColor(event.target.checked)}
              className='checkbox checkbox-xs rounded-sm'
            />
            <span>currentColor</span>
          </label>

          <label className='flex items-center gap-2 text-sm text-base-content/80'>
            <span>Target height</span>
            <input
              type='number'
              min='1'
              step='1'
              value={targetHeight}
              onChange={handleTargetHeightChange}
              disabled={!normalizeViewBox}
              className='input input-sm w-16 rounded-lg border-base-300/80 bg-base-300/20 disabled:opacity-50'
            />
          </label>

          {result ? (
            <div className='flex flex-wrap items-center justify-center gap-4 text-sm text-base-content/80 w-1/3'>
              <span className='text-orange-200'>{result.stats.originalBytes.toLocaleString()}B in</span>
              <span className='text-sky-200'>{result.stats.optimizedBytes.toLocaleString()}B out</span>
              <span className='text-emerald-200'>{result.stats.bytesSaved.toLocaleString()}B saved</span>
              <span className=''>
                <span className='font-bold text-sky-300 tracking-tight'>{result.stats.percentSaved}%</span> smaller
              </span>
            </div>
          ) : null}

          <div className='ml-auto flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={handleCopy}
              disabled={!output}
              className='btn btn-soft bg-sky-300 text-black/80 rounded-lg disabled:opacity-50'>
              <Icon name={isCopied ? 'check' : 'copy-fill'} className='size-4' />
              <span>{isCopied ? 'Copied' : 'Copy Output'}</span>
            </button>
            <button
              type='button'
              onClick={handleDownload}
              disabled={!output}
              className='btn btn-soft rounded-lg disabled:opacity-50'>
              <Icon name='download' className='size-4' />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className='grid flex-1 grid-cols-1 gap-px bg-base-300/50 md:grid-cols-3'>
        <section className='flex min-w-0 flex-col bg-base-100'>
          <header className='flex items-center justify-between border-b border-base-300/80 px-4 h-16 xl:px-6'>
            <div className='min-w-0'>
              <span className='text-sm font-semibold uppercase tracking-wider text-orange-200/90'>Original</span>
              <p className='truncate text-xs text-base-content/50'>{fileName}</p>
            </div>
          </header>

          <XmlEditor
            value={input}
            onChange={setInput}
            placeholder={PLACEHOLDER}
            ariaLabel='SVG input'
            className='min-h-80 flex-1'
          />
        </section>

        <section className='grid min-w-0 grid-rows-[auto_minmax(0,1fr)] bg-base-100'>
          <header className='flex items-center justify-between border-b border-base-300/80 px-4 h-16 xl:px-6'>
            <span className='text-sm font-semibold uppercase tracking-wider text-pink-300/90'>Optimized</span>
          </header>

          <div className='grid min-h-0 grid-rows-[minmax(13rem,16rem)_minmax(0,1fr)] bg-gray-300'>
            <div className='px-4 py-4 xl:px-6'>
              <div className='flex h-full flex-col gap-3'>
                <div className='flex flex-wrap items-center gap-3 text-xs text-base-content/60'>
                  <span>viewBox</span>
                  <span className='text-orange-200'>
                    Original: <code>{result?.viewBox.original ?? 'none'}</code>
                  </span>
                  <span className='text-sky-200'>
                    Optimized: <code>{result?.viewBox.optimized ?? 'none'}</code>
                  </span>
                  {result?.viewBox.normalized ? (
                    <span>Normalized to {result.viewBox.targetHeight}px height</span>
                  ) : null}
                </div>

                <div className='grid flex-1 place-items-center rounded-xs border border-base-300 p-4'>
                  {previewSrc ? (
                    <Image
                      src={previewSrc}
                      alt='Optimized SVG preview'
                      width={400}
                      height={400}
                      unoptimized
                      className='max-h-full max-w-full fill-amber-50 h-auto w-auto object-contain'
                    />
                  ) : (
                    <div className='text-sm text-base-content/40'>Preview appears after optimization.</div>
                  )}
                </div>
                <div className='flex w-full h-44 gap-4'>
                  <Image
                    src={previewSrc}
                    alt='Optimized SVG preview'
                    width={80}
                    height={80}
                    unoptimized
                    className='max-h-full max-w-full fill-amber-50 h-auto w-auto object-contain'
                  />
                  <Image
                    src={previewSrc}
                    alt='Optimized SVG preview'
                    width={40}
                    height={40}
                    unoptimized
                    className='max-h-full max-w-full fill-amber-50 h-20 w-auto object-contain'
                  />
                  <Image
                    src={previewSrc}
                    alt='Optimized SVG preview'
                    width={40}
                    height={40}
                    unoptimized
                    className='max-h-full max-w-full fill-amber-50 h-10 w-auto object-contain'
                  />
                </div>
                {error ? <p className='text-sm text-red-300'>{error}</p> : null}
              </div>
            </div>
          </div>
        </section>
        <section className=' bg-base-100'>
          <header className='flex items-center justify-between border-b border-base-300/80 px-4 h-16 xl:px-6'>
            <span className='text-sm font-semibold uppercase tracking-wider text-sky-300/90'>Output</span>
          </header>
          <XmlCodeBlock
            value={output}
            placeholder='<optimized SVG output>'
            className='min-h-0 overflow-auto text-balance'
          />
        </section>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='.svg,image/svg+xml'
        onChange={handleFileChange}
        className='hidden'
      />
    </main>
  )
}

const XML_EDITOR_TEXT_CLASS =
  'w-full border-0 bg-transparent p-4 font-mono text-sm leading-relaxed outline-none xl:px-6 whitespace-pre-wrap break-words'
const XML_TOKEN_COMMENT_CLASS = 'text-base-content/35'
const XML_TOKEN_PUNCTUATION_CLASS = 'text-base-content/45'
const XML_TOKEN_TAG_CLASS = 'text-sky-300'
const XML_TOKEN_ATTRIBUTE_CLASS = 'text-orange-200'
const XML_TOKEN_VALUE_CLASS = 'text-emerald-300'
const XML_TOKEN_DECLARATION_CLASS = 'text-violet-300'

interface XmlEditorProps {
  ariaLabel: string
  className?: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}

const XmlEditor = ({ ariaLabel, className, onChange, placeholder, value }: XmlEditorProps) => {
  const overlayRef = useRef<HTMLPreElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const displayValue = value || placeholder
  const highlightedValue = useMemo(() => highlightSvgXml(displayValue), [displayValue])

  const syncScroll = useCallback(() => {
    if (!overlayRef.current || !textareaRef.current) return
    overlayRef.current.scrollTop = textareaRef.current.scrollTop
    overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
  }, [])

  useEffect(() => {
    syncScroll()
  }, [syncScroll, value])

  return (
    <div className={cn('relative min-h-0', className)}>
      <pre
        ref={overlayRef}
        aria-hidden='true'
        className={cn(
          XML_EDITOR_TEXT_CLASS,
          'pointer-events-none absolute inset-0 overflow-auto',
          !value && 'opacity-35'
        )}>
        <code dangerouslySetInnerHTML={{ __html: highlightedValue }} />
      </pre>
      <textarea
        ref={textareaRef}
        aria-label={ariaLabel}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        className={cn(
          XML_EDITOR_TEXT_CLASS,
          'relative z-10 min-h-full resize-none text-transparent caret-base-content selection:bg-sky-300/25 selection:text-transparent'
        )}
      />
    </div>
  )
}

interface XmlCodeBlockProps {
  className?: string
  placeholder?: string
  value: string
}

const XmlCodeBlock = ({ className, placeholder, value }: XmlCodeBlockProps) => {
  const displayValue = value || placeholder || ''
  const highlightedValue = useMemo(() => highlightSvgXml(displayValue), [displayValue])

  return (
    <pre
      className={cn(
        XML_EDITOR_TEXT_CLASS,
        'min-h-0 h-full overflow-auto text-base-content/90',
        !value && 'opacity-40',
        className
      )}>
      <code dangerouslySetInnerHTML={{ __html: highlightedValue }} />
    </pre>
  )
}

function highlightSvgXml(source: string): string {
  if (!source) return ''

  const tokenPattern = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/?[\w:.-]+(?:\s+[\s\S]*?)?\/?>/gi
  let result = ''
  let lastIndex = 0

  for (const match of source.matchAll(tokenPattern)) {
    const token = match[0]
    const index = match.index ?? 0

    result += escapeHtml(source.slice(lastIndex, index))
    result += highlightXmlToken(token)
    lastIndex = index + token.length
  }

  result += escapeHtml(source.slice(lastIndex))
  return result
}

function highlightXmlToken(token: string): string {
  if (token.startsWith('<!--')) {
    return wrapToken(escapeHtml(token), XML_TOKEN_COMMENT_CLASS)
  }

  if (token.startsWith('<?') || token.toUpperCase().startsWith('<!DOCTYPE')) {
    return wrapToken(escapeHtml(token), XML_TOKEN_DECLARATION_CLASS)
  }

  const match = token.match(/^<\s*(\/?)([\w:.-]+)([\s\S]*?)(\/?)\s*>$/)
  if (!match) {
    return escapeHtml(token)
  }

  const [, closingSlash, tagName, rawAttributes, selfClosingSlash] = match
  const open = `&lt;${closingSlash}`
  const close = `${selfClosingSlash}&gt;`

  return [
    wrapToken(open, XML_TOKEN_PUNCTUATION_CLASS),
    wrapToken(escapeHtml(tagName), XML_TOKEN_TAG_CLASS),
    highlightXmlAttributes(rawAttributes),
    wrapToken(close, XML_TOKEN_PUNCTUATION_CLASS)
  ].join('')
}

function highlightXmlAttributes(rawAttributes: string): string {
  if (!rawAttributes) return ''

  const attrPattern = /([\w:.-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+)/g
  let result = ''
  let lastIndex = 0

  for (const match of rawAttributes.matchAll(attrPattern)) {
    const [fullMatch, attributeName, equalsPart, valuePart] = match
    const index = match.index ?? 0

    result += escapeHtml(rawAttributes.slice(lastIndex, index))
    result += wrapToken(escapeHtml(attributeName), XML_TOKEN_ATTRIBUTE_CLASS)
    result += wrapToken(escapeHtml(equalsPart), XML_TOKEN_PUNCTUATION_CLASS)
    result += wrapToken(escapeHtml(valuePart), XML_TOKEN_VALUE_CLASS)
    lastIndex = index + fullMatch.length
  }

  result += escapeHtml(rawAttributes.slice(lastIndex))
  return result
}

function wrapToken(value: string, className: string): string {
  return `<span class="${className}">${value}</span>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
