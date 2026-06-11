'use client'

import { useCopy } from '@/hooks/use-copy'
import { useCallback, useDeferredValue, useMemo, useState, type ClipboardEvent } from 'react'

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

type OutputMode = 'typescript' | 'convex'

function toCamelCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? part.toLowerCase() : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
    )
    .join('')
}

function toPascalCase(input: string): string {
  const camel = toCamelCase(input)
  return camel ? `${camel.charAt(0).toUpperCase()}${camel.slice(1)}` : 'Generated'
}

function toTableName(input: string): string {
  return toCamelCase(input) || 'generated'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function inferConvexValue(value: unknown, indent: string): string {
  if (value === null) return 'v.null()'
  if (value === undefined) return 'v.optional(v.any())'
  if (typeof value === 'string') return 'v.string()'
  if (typeof value === 'number') return 'v.number()'
  if (typeof value === 'boolean') return 'v.boolean()'
  if (typeof value === 'bigint') return 'v.int64()'
  if (typeof value === 'symbol' || typeof value === 'function') return 'v.any()'

  if (value instanceof Date) return 'v.string()'
  if (value instanceof RegExp) return 'v.string()'

  if (Array.isArray(value)) {
    const elementValidator = value.length > 0 ? inferConvexValue(value[0], indent) : 'v.any()'
    return `v.array(${elementValidator})`
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return 'v.object({})'
    const lines = entries.map(([key, item]) => `${indent}  ${escapeKey(key)}: ${inferConvexValue(item, `${indent}  `)}`)
    return `v.object({\n${lines.join('\n')}\n${indent}})`
  }

  return 'v.any()'
}

type JsonSchemaProperty = {
  type?: string | string[]
  description?: string
  default?: unknown
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
  items?: JsonSchemaProperty
  anyOf?: JsonSchemaProperty[]
  oneOf?: JsonSchemaProperty[]
  enum?: unknown[]
}

function inferTsFromJsonSchema(schema: JsonSchemaProperty, indent: string, required = true): string {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map((item) => JSON.stringify(item)).join(' | ')
  }

  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []
  const normalized = types.length > 0 ? types : ['unknown']
  const optional = !required ? ' | undefined' : ''

  if (normalized.includes('null') && normalized.length === 1) return `null${optional}`
  if (normalized.includes('string')) return `string${optional}`
  if (normalized.includes('number') || normalized.includes('integer')) return `number${optional}`
  if (normalized.includes('boolean')) return `boolean${optional}`
  if (normalized.includes('object') && schema.properties) {
    const requiredKeys = new Set(schema.required ?? [])
    const lines = Object.entries(schema.properties).map(([key, prop]) => {
      const isRequired = requiredKeys.has(key)
      return `${indent}  ${escapeKey(key)}${isRequired ? '' : '?'}: ${inferTsFromJsonSchema(
        prop,
        `${indent}  `,
        isRequired
      )}`
    })
    return `{\n${lines.join('\n')}\n${indent}}${optional}`
  }
  if (normalized.includes('array')) {
    const itemType = schema.items ? inferTsFromJsonSchema(schema.items, indent, true) : 'unknown'
    return `${itemType}[]${optional}`
  }
  if (normalized.includes('null')) return `null${optional}`
  return `unknown${optional}`
}

function inferConvexFromJsonSchema(schema: JsonSchemaProperty, indent: string, required = true): string {
  if (schema.enum && schema.enum.length > 0) {
    const validators = schema.enum.map((item) => inferConvexValue(item, ''))
    return validators.length === 1 ? validators[0] : `v.union(${validators.join(', ')})`
  }

  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : []
  const nullable = types.includes('null')

  const base = types.includes('string')
    ? 'v.string()'
    : types.includes('number') || types.includes('integer')
      ? 'v.number()'
      : types.includes('boolean')
        ? 'v.boolean()'
        : types.includes('array')
          ? schema.items
            ? `v.array(${inferConvexFromJsonSchema(schema.items, indent, true)})`
            : 'v.array(v.any())'
          : types.includes('object') && schema.properties
            ? (() => {
                const requiredKeys = new Set(schema.required ?? [])
                const lines = Object.entries(schema.properties).map(([key, prop]) => {
                  const isRequired = requiredKeys.has(key)
                  const validator = inferConvexFromJsonSchema(prop, `${indent}  `, isRequired)
                  return `${indent}  ${escapeKey(key)}: ${validator}`
                })
                return `{\n${lines.join('\n')}\n${indent}}`
              })()
            : 'v.any()'

  const wrapped = nullable ? `v.union(${base}, v.null())` : base
  return required ? wrapped : `v.optional(${wrapped})`
}

function jsonSchemaToTsDef(obj: unknown, rootName = 'Generated'): string {
  if (!isPlainObject(obj)) {
    return jsonToTsDef(obj, rootName)
  }

  if (obj.type === 'object' && obj.properties) {
    const body = inferTsFromJsonSchema(obj as JsonSchemaProperty, '  ')
    return `export interface ${rootName} ${body}\n`
  }

  return jsonToTsDef(obj, rootName)
}

function jsonSchemaToConvexSchema(obj: unknown, rootName = 'generated'): string {
  if (isPlainObject(obj) && obj.name && typeof obj.name === 'string' && obj.type === 'object' && obj.properties) {
    const tableName = toTableName(obj.name)
    const body = inferConvexFromJsonSchema(obj as JsonSchemaProperty, '  ')
    return [
      `import { defineSchema, defineTable } from 'convex/server'`,
      `import { v } from 'convex/values'`,
      '',
      'export default defineSchema({',
      `  ${tableName}: defineTable(${body}),`,
      '})',
      '',
    ].join('\n')
  }

  return [
    `import { v } from 'convex/values'`,
    '',
    `export const ${toCamelCase(rootName) || 'generated'} = ${inferConvexValue(obj, '')}`,
    '',
  ].join('\n')
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
  const [mode, setMode] = useState<OutputMode>('typescript')
  const deferredInput = useDeferredValue(input)
  const { isCopied, copy } = useCopy({})

  const result = parseInput(deferredInput)
  const output = useMemo(() => {
    if (!result.ok) return `<- ${result.error}`

    if (mode === 'convex') {
      return jsonSchemaToConvexSchema(result.data)
    }

    if (isPlainObject(result.data) && result.data.type === 'object' && result.data.properties) {
      return jsonSchemaToTsDef(result.data, toPascalCase(String(result.data.name ?? 'Generated')))
    }

    return jsonToTsDef(result.data)
  }, [mode, result])

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
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setMode('typescript')}
                className={`rounded-md px-2.5 py-1 font-arc text-xs tracking-wider ${
                  mode === 'typescript' ? 'bg-base-300/80 text-base-content' : 'bg-base-300/50 hover:bg-base-300/80'
                }`}>
                TypeScript
              </button>
              <button
                type='button'
                onClick={() => setMode('convex')}
                className={`rounded-md px-2.5 py-1 font-arc text-xs tracking-wider ${
                  mode === 'convex' ? 'bg-base-300/80 text-base-content' : 'bg-base-300/50 hover:bg-base-300/80'
                }`}>
                Convex
              </button>
            </div>
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
