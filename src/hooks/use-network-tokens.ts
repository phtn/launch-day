'use client'

import { useEffect, useMemo, useState } from 'react'
import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { getBalance } from '@wagmi/core'
import { useAppKitAccount } from '@reown/appkit/react'
import { useChainId } from 'wagmi'
import { config } from '@/ctx/wagmi/config'
import { ERC20_BALANCE_ABI, getUsdcAddress, isUsdcSupportedChain } from '@/lib/usdc'
import type { Token } from '@/components/txn/token'

export interface TokenBalance {
  token: Token
  value: bigint
  formatted: string
  decimals: number
  isLoading: boolean
  error: Error | null
}

export interface NetworkTokensResult {
  tokens: TokenBalance[]
  isLoading: boolean
}

/**
 * Fetches token balances for the current network.
 * Returns tokens with balance > 0 (ETH native balance and USDC if supported).
 */
export function useNetworkTokens(): NetworkTokensResult {
  const { address } = useAppKitAccount()
  const chainId = useChainId()

  // Get USDC address if supported
  const usdcAddress = useMemo(
    () => (isUsdcSupportedChain(chainId) ? getUsdcAddress(chainId) : undefined),
    [chainId]
  )

  // Fetch native ETH balance
  const [ethBalance, setEthBalance] = useState<bigint | null>(null)
  const [ethLoading, setEthLoading] = useState(false)
  const [ethError, setEthError] = useState<Error | null>(null)

  // Fetch USDC balance
  const {
    data: usdcBalanceRaw,
    isLoading: usdcLoading,
    error: usdcError,
  } = useReadContract({
    abi: ERC20_BALANCE_ABI,
    address: usdcAddress,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: Boolean(address && usdcAddress) },
  })

  const { data: usdcDecimalsRaw } = useReadContract({
    abi: ERC20_BALANCE_ABI,
    address: usdcAddress,
    functionName: 'decimals',
    query: { enabled: Boolean(usdcAddress) },
  })

  // Fetch ETH balance
  useEffect(() => {
    if (!address) {
      setEthBalance(null)
      setEthLoading(false)
      return
    }

    setEthLoading(true)
    getBalance(config, {
      address: address as `0x${string}`,
      chainId,
    })
      .then((bal) => {
        setEthBalance(bal.value)
        setEthError(null)
      })
      .catch((err) => {
        setEthError(err as Error)
        setEthBalance(null)
      })
      .finally(() => {
        setEthLoading(false)
      })
  }, [address, chainId])

  const usdcDecimals = usdcDecimalsRaw !== undefined ? Number(usdcDecimalsRaw) : 6
  const usdcValue = usdcBalanceRaw ?? BigInt(0)
  const usdcFormatted = useMemo(
    () => formatUnits(usdcValue, usdcDecimals),
    [usdcValue, usdcDecimals]
  )

  const ethFormatted = useMemo(() => {
    if (!ethBalance) return '0'
    // ETH uses 18 decimals
    return formatUnits(ethBalance, 18)
  }, [ethBalance])

  // Build token balances array
  const tokens = useMemo<TokenBalance[]>(() => {
    const result: TokenBalance[] = []

    // Add ETH if balance > 0
    if (ethBalance && ethBalance > BigInt(0)) {
      result.push({
        token: 'ethereum',
        value: ethBalance,
        formatted: ethFormatted,
        decimals: 18,
        isLoading: ethLoading,
        error: ethError,
      })
    }

    // Add USDC if balance > 0 and supported
    if (usdcAddress && usdcValue > BigInt(0)) {
      result.push({
        token: 'usdc',
        value: usdcValue,
        formatted: usdcFormatted,
        decimals: usdcDecimals,
        isLoading: usdcLoading,
        error: usdcError as Error | null,
      })
    }

    return result
  }, [
    ethBalance,
    ethFormatted,
    ethLoading,
    ethError,
    usdcAddress,
    usdcValue,
    usdcFormatted,
    usdcDecimals,
    usdcLoading,
    usdcError,
  ])

  const isLoading = ethLoading || usdcLoading

  return {
    tokens,
    isLoading,
  }
}
