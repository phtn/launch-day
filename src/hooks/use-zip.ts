import { useCallback, useMemo } from 'react'

interface Props {
  uuid?: string
  short?: string
  bytes?: string
  hex?: string
  input?: string
  b64?: string
}
export const useZip = ({ uuid, short, bytes, input }: Props) => {
  const encBURL = useCallback(
    (_bytes: Uint8Array): string => {
      const _b64 = Buffer.from(bytes ?? _bytes).toString('base64')
      return _b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    },
    [bytes]
  )

  const zipUUID = useCallback(
    (_uuid: string): string => {
      const hex = uuid ?? _uuid?.replace(/-/g, '')
      const _bytes = new Uint8Array(hex?.length / 2)
      for (let i = 0; i < hex?.length; i += 2) {
        _bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
      }
      return encBURL(_bytes)
    },
    [encBURL, uuid]
  )

  const decBURL = useCallback(
    (_input: string): Uint8Array => {
      const _b64 = input ?? _input.replace(/-/g, '+').replace(/_/g, '/')
      const pad = _b64.length % 4 ? '='.repeat(4 - (_b64.length % 4)) : ''
      return Uint8Array.from(Buffer.from(_b64 + pad, 'base64'))
    },
    [input]
  )

  const unzUUID = useCallback(
    (_short: string): string => {
      const _bytes = decBURL(short ?? _short)
      const _hex = Array.from(_bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      return `${_hex.slice(0, 8)}-${_hex.slice(8, 12)}-${_hex.slice(12, 16)}-${_hex.slice(16, 20)}-${_hex.slice(20)}`
    },
    [short, decBURL]
  )

  /// === /// === /// === ///

  const uuidToShort = useMemo(() => new Map<string, string>(), [])
  const shortToUuid = useMemo(() => new Map<string, string>(), [])
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const base = chars.length
  let counter = 1

  const encode = useCallback(
    (n: number): string => {
      let result = ''
      do {
        result = chars[n % base] + result
        n = Math.floor(n / base)
      } while (n > 0)
      return result.padStart(6, '0')
    },
    [base]
  )

  const shorten = useCallback(
    (uuid: string): string => {
      if (uuidToShort.has(uuid)) return uuidToShort.get(uuid)!

      const short = encode(counter++)
      uuidToShort.set(uuid, short)
      shortToUuid.set(short, uuid)
      return short
    },
    [encode, shortToUuid, uuidToShort, counter]
  )

  const expand = useCallback(
    (short: string): string | undefined => {
      return shortToUuid.get(short)
    },
    [shortToUuid]
  )

  return {
    zipUUID,
    unzUUID,
    encBURL,
    decBURL,
    encode,
    expand,
    shorten
  }
}
