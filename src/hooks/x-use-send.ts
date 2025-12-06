import { useCallback } from 'react'
import { type Address, type Chain, parseEther } from 'viem'
import { useSendTransaction } from 'wagmi'

interface SendFromParams {
  to: Address
  usd: number
  chainId?: Chain
}

const TO = '0x611F3143b76a994214d751d762b52D081d8DC4de'

export const useSend = () => {
  const stxn = useSendTransaction()

  const send = useCallback(
    ({ to = TO, usd }: SendFromParams) => {
      const value = parseEther(usd_2_eth(usd))
      console.table([{ usd }, { value }])
      stxn.mutate({
        to,
        value
      })
    },
    [stxn]
  )

  return {
    send
  }
}

export const eth_2_usd = (eth: bigint) => {
  const c = 3039.96
  return c * Number(eth)
}

const usd_2_eth = (usd: number): string => {
  const c = 3039.96
  return (usd / c).toPrecision(2)
}
