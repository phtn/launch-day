'use client'

import { useCopy } from '@/hooks/use-copy'
import { useCallback, useDeferredValue, useState, type ClipboardEvent } from 'react'

function escapeKey(key: string): string {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) return key
  return `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function inferTsType(value: unknown, indent: string): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'bigint') return 'bigint'
  if (typeof value === 'symbol') return 'symbol'
  if (typeof value === 'function') return '(...args: unknown[]) => unknown'
  if (Array.isArray(value)) {
    const elementType = value.length > 0 ? inferTsType(value[0], indent) : 'unknown'
    return `${elementType}[]`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return 'Record<string, unknown>'
    const lines = entries.map(([k, v]) => {
      const type = inferTsType(v, `${indent}  `)
      return `${indent}  ${escapeKey(k)}: ${type}`
    })
    return `{\n${lines.join('\n')}\n${indent}}`
  }
  return 'unknown'
}

function jsonToTsDef(obj: unknown, rootName = 'Generated'): string {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    const type = inferTsType(obj, '')
    return `export type ${rootName} = ${type}\n`
  }
  const body = inferTsType(obj, '  ')
  return `export interface ${rootName} ${body}\n`
}

/** Strip "export const obj = ", "const obj = ", "export default ", etc. and trailing semicolon so we parse only the value. */
function stripDeclarationPrefix(input: string): string {
  let s = input.trim()
  const decl = /^\s*(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*/
  if (decl.test(s)) {
    s = s.replace(decl, '')
  } else {
    const defaultExport = /^\s*export\s+default\s+/
    if (defaultExport.test(s)) {
      s = s.replace(defaultExport, '')
    }
  }
  return s.replace(/;\s*$/, '').trim()
}

function parseInput(raw: string): { ok: true; data: unknown } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: 'Paste JSON or an object' }
  }
  const toParse = stripDeclarationPrefix(trimmed)
  if (!toParse) {
    return { ok: false, error: 'Invalid JSON or JavaScript object' }
  }
  try {
    const data = JSON.parse(toParse) as unknown
    return { ok: true, data }
  } catch {
    try {
      const fn = new Function(`return (${toParse})`)
      const data = fn() as unknown
      return { ok: true, data }
    } catch {
      return { ok: false, error: 'Invalid JSON or JavaScript object' }
    }
  }
}

function formatValue(value: unknown, depth = 0, seen = new WeakSet<object>()): string {
  const indent = '  '.repeat(depth)
  const nextIndent = '  '.repeat(depth + 1)

  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol' || typeof value === 'function') return String(value)
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'new Date(NaN)' : `new Date(${JSON.stringify(value.toISOString())})`
  }
  if (value instanceof RegExp) return value.toString()

  if (Array.isArray(value)) {
    if (seen.has(value)) return JSON.stringify('[Circular]')
    seen.add(value)

    if (value.length === 0) {
      seen.delete(value)
      return '[]'
    }

    const items = value.map((item) => `${nextIndent}${formatValue(item, depth + 1, seen)}`)
    seen.delete(value)
    return `[\n${items.join(',\n')}\n${indent}]`
  }

  if (typeof value === 'object') {
    if (seen.has(value)) return JSON.stringify('[Circular]')
    seen.add(value)

    if (value instanceof Map) {
      if (value.size === 0) {
        seen.delete(value)
        return 'new Map()'
      }

      const entries = Array.from(value.entries()).map(
        ([key, item]) => `${nextIndent}[${formatValue(key, depth + 1, seen)}, ${formatValue(item, depth + 1, seen)}]`
      )

      seen.delete(value)
      return `new Map([\n${entries.join(',\n')}\n${indent}])`
    }

    if (value instanceof Set) {
      if (value.size === 0) {
        seen.delete(value)
        return 'new Set()'
      }

      const items = Array.from(value.values()).map((item) => `${nextIndent}${formatValue(item, depth + 1, seen)}`)

      seen.delete(value)
      return `new Set([\n${items.join(',\n')}\n${indent}])`
    }

    const entries = Object.entries(value)
    if (entries.length === 0) {
      seen.delete(value)
      return '{}'
    }

    const lines = entries.map(
      ([key, item]) => `${nextIndent}${JSON.stringify(key)}: ${formatValue(item, depth + 1, seen)}`
    )

    seen.delete(value)
    return `{\n${lines.join(',\n')}\n${indent}}`
  }

  return 'undefined'
}

function prettifyInput(raw: string): string {
  const result = parseInput(raw)
  return result.ok ? formatValue(result.data) : raw
}

const PLACEHOLDER = `{
  "name": "Acme",
  "count": 42,
  "active": true,
  "tags": ["a", "b"],
  "meta": { "key": "value" }
}`

export const Content = () => {
  const [input, setInput] = useState('')
  const deferredInput = useDeferredValue(input)
  const { isCopied, copy } = useCopy({})

  const result = parseInput(deferredInput)
  const output = result.ok === true ? jsonToTsDef(result.data) : `<- ${result.error}`

  const handleCopy = useCallback(() => {
    if (result.ok && output) copy('typedef', output)
  }, [copy, result.ok, output])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(prettifyInput(text))
    } catch {
      // clipboard read denied or unsupported
    }
  }, [])

  const handleInputPaste = useCallback((event: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = event.clipboardData.getData('text')
    if (!text) return

    event.preventDefault()

    const { selectionStart, selectionEnd, value } = event.currentTarget
    const nextValue = `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`
    setInput(prettifyInput(nextValue))
  }, [])

  return (
    <main className='md:mt-16 flex min-h-[calc(100vh-5rem)] flex-col'>
      <div className='grid flex-1 grid-cols-1 gap-px bg-base-300/50 lg:grid-cols-[1fr_1fr]'>
        <section className='flex min-w-0 flex-col bg-base-100'>
          <header className='flex shrink-0 items-center justify-between border-b border-base-300/80 px-4 py-2.5'>
            <span className='font-bsi text-sm font-bold uppercase tracking-wider text-orange-300 opacity-80'>JSON</span>
            <button
              type='button'
              onClick={handlePaste}
              className='rounded-md px-2.5 py-1 font-arc text-xs bg-base-300/50 hover:bg-base-300/80 hover:text-base-content tracking-wider'>
              Paste
            </button>
          </header>
          <textarea
            aria-label='JSON input'
            className='min-h-70 flex-1 resize-none border-0 bg-transparent p-4 font-brk text-sm leading-relaxed text-base-content outline-none placeholder:text-base-content/40'
            placeholder={PLACEHOLDER}
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handleInputPaste}
          />
        </section>

        <section className='flex min-w-0 flex-col bg-base-100'>
          <header className='flex shrink-0 items-center justify-between border-b border-base-300/80 px-4 py-2.5'>
            <span className='font-bsi font-bold text-sm text-[#3178c6] uppercase tracking-wider'>TypeScript</span>
            <button
              type='button'
              onClick={handleCopy}
              disabled={!result.ok || !output}
              className='rounded-md px-2.5 py-1 font-arc text-xs bg-base-300/50 hover:bg-base-300/80 hover:text-base-content tracking-wider'>
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </header>
          <pre
            aria-label='TypeScript output'
            className='min-h-70 flex-1 overflow-auto p-4 font-ios text-sm leading-relaxed text-base-content/90'>
            <code>{output}</code>
          </pre>
        </section>
      </div>
    </main>
  )
}
