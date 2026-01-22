import { useNetworkTokens } from '@/hooks/use-network-tokens'
import { useSend } from '@/hooks/x-use-send'
import { getTransactionExplorerUrl } from '@/lib/explorer'
import { Icon } from '@/lib/icons'
import { getUsdcAddress, isUsdcSupportedChain } from '@/lib/usdc'
import { cn } from '@/lib/utils'
import { mainnet, polygon, polygonAmoy, sepolia } from '@reown/appkit/networks'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { formatUnits, parseUnits, type Address } from 'viem'
import { useChainId, useChains, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { Title } from './components'
import { NetworkSelector } from './network-selector'
import { ReceiptModal } from './receipt-modal'
import type { Token } from './token'
import { Tokens } from './token-list'
import { TransactionHashLink } from './transaction-hash-link'
import { PayTabProps } from './types'

interface PayStateProps {
  tokenAmount: string
  tokenSymbol: string
  usdValue: number | null
}

const PayState = ({ tokenAmount, tokenSymbol, usdValue }: PayStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='relative rounded-xl bg-white/5 border border-white/10 space-y-0 overflow-hidden'>
      <div className='absolute bg-[url("/svg/noise.svg")] opacity-15 scale-100 pointer-events-none top-0 left-0 w-full h-full' />
      <div className='relative px-4 py-6'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='w-12 h-12 rounded-full border-2 border-rose-300/30 border-t-rose-300 flex items-center justify-center'>
            <Icon name='spinner-ring' className='w-6 h-6 text-rose-100' />
          </motion.div>
          <div className='text-center space-y-1'>
            <p className='font-polyn font-bold text-xl text-white/80'>Processing Payment</p>
            <p className='text-xs font-brk text-white/50'>Please confirm in your wallet</p>
          </div>
        </div>
        <div className='mt-6 pt-4 border-t border-white/10 border-dashed space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-exo font-bold italic uppercase opacity-60'>Amount</span>
            <div className='text-right'>
              <span className='text-sm font-okxs text-white'>
                {tokenAmount} <span className='uppercase'>{tokenSymbol}</span>
              </span>
              {usdValue !== null && (
                <p className='text-sm font-okxs leading-none flex items-center space-x-1'>
                  <span className='font-mono text-lg'>≈</span>
                  <span>
                    <span className='opacity-70'>$</span>
                    <span className=''>
                      {usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface SuccessStateProps {
  tokenAmount: string
  tokenSymbol: string
  usdValue: number | null
  hash: `0x${string}` | null
  explorerUrl: string | null
}

const SuccessState = ({ tokenAmount, tokenSymbol, usdValue, hash, explorerUrl }: SuccessStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className='relative rounded-3xl border border-emerald-400/30 space-y-0 overflow-hidden'>
      <div className='absolute bg-[url("/svg/noise.svg")] opacity-15 scale-100 pointer-events-none top-0 left-0 w-full h-full' />
      <div className='relative bg-emerald-500/10 px-4 py-6'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className='w-14 h-14 relative rounded-full border-6 border-emerald-300/2 bg-emerald-400/10 backdrop-blur-3xl flex items-center justify-center'>
            <Icon name='check' className='w-8 h-8 absolute blur-xl text-emerald-300 animate-pulse' />
            <Icon name='check' className='w-6 h-6 absolute blur-xs text-white' />
            <Icon name='check' className='w-6 h-6 relative text-emerald-200' />
          </motion.div>
          <div className='text-center space-y-1'>
            <p className='text-lg font-polyn font-bold text-emerald-50'>Transaction Successful</p>
            <p className='text-xs font-brk opacity-70'>Your transaction has been confirmed</p>
          </div>
        </div>
        <div className='mt-6 pt-4 border-t border-emerald-200/20 border-dashed space-y-3'>
          <div className='flex items-start justify-between'>
            <span className='text-sm font-exo font-bold italic uppercase opacity-70'>Amount</span>
            <div className='text-right'>
              <span className='text-sm font-okxs font-medium text-white'>
                {tokenAmount} <span className='uppercase'>{tokenSymbol}</span>
              </span>
              {usdValue !== null && (
                <p className='text-sm font-okxs text-white/50'>
                  ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
          {hash && (
            <div className='flex items-center justify-between pt-2'>
              <span className='text-sm font-exo font-bold italic uppercase opacity-60'>txn hash</span>
              <TransactionHashLink
                hash={hash}
                explorerUrl={explorerUrl}
                truncate
                className='text-xs font-brk max-w-50'
                linkClassName='text-emerald-300 hover:text-emerald-200'
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const PayTab = ({
  formattedBalance: _formattedBalance,
  balance,
  tokenPrice,
  disabled,
  onSend,

  amountInputRef: _amountInputRef,

  addressInputRef: _addressInputRef,

  setTo: _setTo,

  setAmount: _setAmountProp,
  to: toProp,
  amount: amountProp,
  isPending = false,
  isConfirming = false,
  receipt = null,
  hash = null,
  explorerUrl = null,
  onReset
}: PayTabProps) => {
  const [recipient, setRecipient] = useState(toProp)
  const [amount, setAmount] = useState(amountProp)

  // Sync local state with parent props
  useEffect(() => {
    setRecipient(toProp)
  }, [toProp])

  useEffect(() => {
    setAmount(amountProp)
  }, [amountProp])

  // Selected token state
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  // Payment amount state (always in USD)
  const [paymentAmountUsd, setPaymentAmountUsd] = useState('0.25')
  // Token used for the last/in-flight payment (so we show correct symbol and use correct tx state)
  const [lastPaymentToken, setLastPaymentToken] = useState<Token | null>(null)

  const chainId = useChainId()
  const chains = useChains()
  const { mutateAsync } = useSwitchChain()
  const { tokens: networkTokens, isLoading: tokensLoading } = useNetworkTokens()
  const [, startTransition] = useTransition()
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const currentChain = useMemo(() => chains.find((c) => c.id === chainId), [chains, chainId])

  // Get actual balance from props
  const actualBalance = useMemo(() => {
    if (!balance) return null
    return Number.parseFloat(formatUnits(balance.value, balance.decimals))
  }, [balance])

  // Get token price (USDC = $1, ETH = tokenPrice prop)
  const getTokenPrice = useCallback(
    (token: Token | null): number | null => {
      if (!token) return null
      if (token === 'usdc') return 1 // USDC is always $1
      if (token === 'ethereum') return tokenPrice
      return null
    },
    [tokenPrice]
  )

  // Calculate token amount from USD amount
  const tokenAmount = useMemo(() => {
    if (!selectedToken || !paymentAmountUsd) return null
    const usdAmount = Number.parseFloat(paymentAmountUsd)
    if (Number.isNaN(usdAmount) || usdAmount <= 0) return null
    const price = getTokenPrice(selectedToken)
    if (!price) return null
    return usdAmount / price
  }, [selectedToken, paymentAmountUsd, getTokenPrice])

  // USD value is the payment amount itself (since it's already in USD)
  const usdValue = useMemo(() => {
    if (!paymentAmountUsd) return null
    const parsedAmount = Number.parseFloat(paymentAmountUsd)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return null
    return parsedAmount
  }, [paymentAmountUsd])

  // Map network names to chain IDs
  const networkChainMap: Record<string, number> = useMemo(
    () => ({
      sepolia: sepolia.id,
      ethereum: mainnet.id,
      polygon: polygon.id,
      amoy: polygonAmoy.id
      // bitcoin is not an EVM chain, so we'll skip it for now
    }),
    []
  )

  // Get current network name from chainId
  const currentNetwork = useMemo(() => {
    if (chainId === sepolia.id) return 'sepolia'
    if (chainId === mainnet.id) return 'ethereum'
    if (chainId === polygon.id) return 'polygon'
    if (chainId === polygonAmoy.id) return 'amoy'
    return null
  }, [chainId])

  // Handle network selection
  const handleNetworkSelect = useCallback(
    (network: string) => () => {
      const targetChainId = networkChainMap[network]
      if (targetChainId && targetChainId !== chainId) {
        startTransition(() => {
          mutateAsync({ chainId: targetChainId })
        })
      }
    },
    [chainId, mutateAsync, startTransition, networkChainMap]
  )

  // Extract token list from network tokens
  const availableTokens = useMemo<Token[]>(() => {
    return networkTokens.map((t) => t.token)
  }, [networkTokens])

  // Get selected token balance
  const selectedTokenBalance = useMemo(() => {
    if (!selectedToken) return null
    return networkTokens.find((t) => t.token === selectedToken) ?? null
  }, [selectedToken, networkTokens])

  // Check if selected token has insufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (!selectedTokenBalance || !tokenAmount) return false
    const balance = Number.parseFloat(selectedTokenBalance.formatted)
    return tokenAmount > balance
  }, [selectedTokenBalance, tokenAmount])

  // Handle token selection
  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedToken(token)
  }, [])

  // Formatted token amount for processing state (selected token)
  const processingTokenAmountFormatted = useMemo(() => {
    if (tokenAmount == null) return ''
    return tokenAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: selectedToken === 'usdc' ? 6 : 8
    })
  }, [tokenAmount, selectedToken])

  // For success/receipt: use lastPaymentToken and USD-based token amount
  const successTokenAmountFormatted = useMemo(() => {
    const tok = lastPaymentToken
    if (!tok || !usdValue) return ''
    const price = getTokenPrice(tok)
    if (!price) return ''
    const amt = usdValue / price
    return amt.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: tok === 'usdc' ? 6 : 8
    })
  }, [lastPaymentToken, usdValue, getTokenPrice])

  const displayTokenSymbol = (t: Token | null) => (t === 'usdc' ? 'USDC' : t === 'ethereum' ? 'ETH' : '—')

  // Get payment destination from environment variable
  const paymentDestination = useMemo(() => {
    const dest = process.env.NEXT_PUBLIC_PAYMENT_DESTINATION_ONE
    if (!dest) {
      console.warn('NEXT_PUBLIC_PAYMENT_DESTINATION_ONE is not set')
      return null
    }
    return dest as Address
  }, [])

  // Hook for sending transactions
  const {
    send: sendEth,
    isPending: isEthPending,
    isConfirming: isEthConfirming,
    hash: ethHash,
    receipt: ethReceipt
  } = useSend()

  // Hook for writing contracts (USDC transfers)
  const { mutate, data: usdcHash, isPending: isUsdcPending, error: usdcError } = useWriteContract()

  // Wait for USDC transaction receipt
  const { isLoading: isUsdcConfirming, data: usdcReceipt } = useWaitForTransactionReceipt({
    hash: usdcHash,
    query: {
      enabled: !!usdcHash,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      refetchInterval: (query) => {
        if (query.state.data) return false
        return 2000
      }
    }
  })

  // Use lastPaymentToken to resolve tx state (token we actually paid with), fallback to selectedToken
  const tokenForTxState = lastPaymentToken ?? selectedToken

  // Determine which transaction state to use (use local state if available, otherwise use props)
  const localIsPending = tokenForTxState === 'ethereum' ? isEthPending : isUsdcPending
  const localIsConfirming = tokenForTxState === 'ethereum' ? isEthConfirming : isUsdcConfirming
  const localHash = tokenForTxState === 'ethereum' ? ethHash : usdcHash
  const localReceipt =
    tokenForTxState === 'ethereum'
      ? ethReceipt
        ? {
            blockNumber: ethReceipt.blockNumber,
            status: ethReceipt.status === 'success' ? ('success' as const) : ('reverted' as const)
          }
        : null
      : usdcReceipt
      ? {
          blockNumber: usdcReceipt.blockNumber,
          status: usdcReceipt.status === 'success' ? ('success' as const) : ('reverted' as const)
        }
      : null

  // Use local transaction state if we have an active transaction, otherwise use props
  const activeIsPending = localIsPending || isPending
  const activeIsConfirming = localIsConfirming || isConfirming
  const activeHash = localHash || hash
  const activeReceipt = localReceipt || receipt

  const receiptExplorerUrl = useMemo(
    () => getTransactionExplorerUrl(currentChain, activeHash) ?? explorerUrl,
    [currentChain, activeHash, explorerUrl]
  )

  // Log pay button conditions (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const conditions = {
        'disabled (prop)': disabled,
        activeIsConfirming: activeIsConfirming,
        activeIsPending: activeIsPending,
        hasInsufficientBalance: hasInsufficientBalance,
        noSelectedToken: !selectedToken,
        noPaymentAmount: !paymentAmountUsd,
        noPaymentDestination: !paymentDestination
      }

      const isDisabled = Object.values(conditions).some(Boolean)

      // Create a detailed table with all conditions
      const conditionTable: Record<string, string> = {}

      Object.entries(conditions).forEach(([key, value]) => {
        conditionTable[key] = value ? '❌ DISABLES BUTTON' : '✅ OK'
      })

      conditionTable['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      conditionTable['FINAL BUTTON STATE'] = isDisabled ? '❌ DISABLED' : '✅ ENABLED'

      console.table(conditionTable)

      // Also log detailed values for debugging
      console.group('🔍 Pay Button Condition Details')
      console.log('Condition Values:', {
        'disabled (prop)': disabled,
        activeIsConfirming: activeIsConfirming,
        activeIsPending: activeIsPending,
        hasInsufficientBalance: hasInsufficientBalance,
        selectedToken: selectedToken || 'null',
        paymentAmountUsd: paymentAmountUsd || 'empty',
        paymentDestination: paymentDestination || 'null'
      })
      console.log('Calculated States:', {
        localIsPending: localIsPending,
        localIsConfirming: localIsConfirming,
        'isPending (prop)': isPending,
        'isConfirming (prop)': isConfirming,
        activeIsPending: activeIsPending,
        activeIsConfirming: activeIsConfirming
      })
      console.log('Final Result:', {
        isDisabled: isDisabled,
        buttonWillBe: isDisabled ? 'DISABLED' : 'ENABLED'
      })
      console.groupEnd()
    }
  }, [
    disabled,
    activeIsConfirming,
    activeIsPending,
    hasInsufficientBalance,
    selectedToken,
    paymentAmountUsd,
    paymentDestination,
    localIsPending,
    localIsConfirming,
    isPending,
    isConfirming
  ])

  // Handle payment
  const handlePay = useCallback(() => {
    if (!selectedToken || !paymentAmountUsd || !paymentDestination || hasInsufficientBalance) {
      return
    }

    const usdAmount = Number.parseFloat(paymentAmountUsd)
    if (Number.isNaN(usdAmount) || usdAmount <= 0) {
      return
    }

    setLastPaymentToken(selectedToken)

    try {
      if (selectedToken === 'ethereum') {
        // Send ETH using the existing send function
        sendEth({ to: paymentDestination, usd: usdAmount })
      } else if (selectedToken === 'usdc') {
        // Send USDC using writeContract
        if (!isUsdcSupportedChain(chainId)) {
          throw new Error('USDC is not supported on this chain')
        }

        const usdcAddress = getUsdcAddress(chainId)
        if (!usdcAddress) {
          throw new Error('USDC address not found for this chain')
        }

        // USDC is $1, so USD amount = USDC amount
        // USDC uses 6 decimals
        const usdcAmount = parseUnits(usdAmount.toFixed(6), 6)

        // ERC20 transfer ABI
        const ERC20_TRANSFER_ABI = [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ] as const

        mutate({
          abi: ERC20_TRANSFER_ABI,
          address: usdcAddress,
          functionName: 'transfer',
          args: [paymentDestination, usdcAmount]
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Error will be handled by the hooks
    }
  }, [selectedToken, paymentAmountUsd, paymentDestination, hasInsufficientBalance, chainId, sendEth, mutate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='space-y-0'>
      {/* Token Selection */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className='mb-5'>
        <Title id='pay-network-selector'>Network</Title>

        <div className='space-y-2 my-2'>
          <NetworkSelector currentNetwork={currentNetwork} onSelectNetwork={handleNetworkSelect} />

          <div className='min-h-32 mx-4'>
            {tokensLoading ? (
              <div className='flex items-center justify-center py-8'>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Icon name='spinner-ring' className='w-6 h-6 text-white/40' />
                </motion.div>
              </div>
            ) : availableTokens.length > 0 ? (
              <Tokens
                tokens={availableTokens}
                tokenBalances={networkTokens}
                selectedToken={selectedToken}
                paymentAmountUsd={paymentAmountUsd}
                tokenPrices={{ usdc: 1, ethereum: tokenPrice }}
                onTokenSelect={handleTokenSelect}
              />
            ) : (
              <div className='relative h-32 rounded-xl overflow-hidden flex items-center bg-linear-to-r from-black/60 mt-4 via-black/20 to-zinc-950/50 justify-center text-white/60 text-sm'>
                <div className='absolute bg-[url("/svg/noise.svg")] opacity-10 scale-100 pointer-events-none top-0 left-0 w-full h-full' />
                <motion.div
                  animate={{ x: [0, 100, 0] }}
                  transition={{ duration: 40, ease: 'easeInOut', repeat: Number.MAX_SAFE_INTEGER }}
                  className='space-y-3 sm:space-y-4 bg-no-repeat opacity-60 bg-[url("/svg/dots.svg")] bg-blend-lighten blur-px w-full h-full absolute -top-1 right-0 bg-top-right'
                />
                <p className=' line-clamp-2 max-w-[18ch] text-center font-okxs'>
                  No tokens with balance found on this network
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Amount Input */}
      {selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='mt-4 hidden '>
          <div className='flex justify-between items-center mb-2'>
            <Title id='pay-amount'>Amount to Pay (USD)</Title>
            {selectedTokenBalance && tokenAmount && (
              <button
                onClick={() => {
                  // Set max USD amount based on token balance
                  const balance = Number.parseFloat(selectedTokenBalance.formatted)
                  const price = getTokenPrice(selectedToken)
                  if (price) {
                    setPaymentAmountUsd((balance * price).toFixed(2))
                  }
                }}
                className='text-xs md:hover:text-indigo-300 transition-colors'>
                <span className='uppercase font-okxs font-bold text-indigo-200'>Max</span>{' '}
                <span className='font-okxs'>
                  {tokenAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className='font-okxs font-light opacity-50 ml-1 uppercase'>{selectedToken}</span>
              </button>
            )}
          </div>
          <div className='relative rounded-2xl border border-zinc-700 overflow-hidden bg-zinc-900/50'>
            <div className='relative px-4 py-4'>
              <div className='flex items-center gap-2'>
                <span className='text-white/40 text-lg'>$</span>
                <input
                  id='pay-amount'
                  type='number'
                  value={paymentAmountUsd}
                  onChange={(e) => setPaymentAmountUsd(e.target.value)}
                  placeholder='0.00'
                  step='0.01'
                  min='0'
                  className='w-full bg-transparent text-2xl font-okxs font-light text-white placeholder-white/20 outline-none'
                />
              </div>
              {tokenAmount && (
                <div className='mt-2 text-sm text-white/50'>
                  ≈ {tokenAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}{' '}
                  <span className='uppercase'>{selectedToken}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Amount Input / Sending / Success State */}
      <div className='mt-4'>
        <AnimatePresence mode='wait'>
          {activeReceipt && activeReceipt.status === 'success' ? (
            <SuccessState
              key='success'
              tokenAmount={successTokenAmountFormatted}
              tokenSymbol={displayTokenSymbol(lastPaymentToken)}
              usdValue={usdValue}
              hash={activeHash || null}
              explorerUrl={receiptExplorerUrl}
            />
          ) : activeIsPending || activeIsConfirming ? (
            <PayState
              key='sending'
              tokenAmount={processingTokenAmountFormatted}
              tokenSymbol={displayTokenSymbol(selectedToken)}
              usdValue={usdValue}
            />
          ) : (
            <div></div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning for insufficient balance */}
      {hasInsufficientBalance && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 mt-4'>
          <Icon name='alert-02' className='w-4 h-4 text-red-400 shrink-0' />
          <p className='text-sm text-red-300'>Insufficient balance for this transaction</p>
        </motion.div>
      )}

      {/* Amount Info */}
      {paymentAmountUsd && usdValue && !activeReceipt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ ease: 'easeInOut' }}>
          <div className='h-px border-dashed-lg' />
          <div className='p-4 border-0 decoration-1 border-white/10'>
            <div className='flex items-center justify-between text-xs md:text-sm'>
              <span className='opacity-70 font-exo font-bold uppercase italic'>Total</span>
              <div className='text-right'>
                <span className='text-white text-2xl font-okxs'>
                  ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Send Button / Send Another Button */}
      <motion.div
        whileHover={{ scale: disabled || activeIsConfirming ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='mt-4 mx-4'>
        {activeReceipt && activeReceipt.status === 'success' && onReset ? (
          <button
            onClick={() => setShowReceiptModal(true)}
            className='flex items-center justify-center w-full mx-auto h-14 text-lg font-semibold rounded-xl bg-linear-to-r from-slate-500 via-slate-400 to-cyan-100 hover:from-slate-500 hover:to-slate-100 text-white border-0 shadow-lg transition-all'>
            <span className='flex items-center font-exo font-semibold italic gap-2'>
              View Receipt
              <Icon name='invoice' className='w-5 h-5' />
            </span>
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={(() => {
              const conditions = {
                disabled: disabled,
                activeIsConfirming: activeIsConfirming,
                activeIsPending: activeIsPending,
                hasInsufficientBalance: hasInsufficientBalance,
                noSelectedToken: !selectedToken,
                noPaymentAmount: !paymentAmountUsd,
                noPaymentDestination: !paymentDestination
              }

              const isDisabled = Object.values(conditions).some(Boolean)

              // Log conditions in a table format
              if (process.env.NODE_ENV === 'development') {
                console.table({
                  Condition: 'Status',
                  'disabled (prop)': disabled ? '❌ DISABLED' : '✅ ENABLED',
                  activeIsConfirming: activeIsConfirming ? '❌ DISABLED' : '✅ ENABLED',
                  activeIsPending: activeIsPending ? '❌ DISABLED' : '✅ ENABLED',
                  hasInsufficientBalance: hasInsufficientBalance ? '❌ DISABLED' : '✅ ENABLED',
                  noSelectedToken: !selectedToken ? '❌ DISABLED' : '✅ ENABLED',
                  noPaymentAmount: !paymentAmountUsd ? '❌ DISABLED' : '✅ ENABLED',
                  noPaymentDestination: !paymentDestination ? '❌ DISABLED' : '✅ ENABLED',
                  '---': '---',
                  'FINAL STATE': isDisabled ? '❌ BUTTON DISABLED' : '✅ BUTTON ENABLED'
                })

                // Also log the actual values for debugging
                console.log('Pay Button Conditions - Values:', {
                  disabled,
                  activeIsConfirming,
                  activeIsPending,
                  hasInsufficientBalance,
                  selectedToken,
                  paymentAmountUsd,
                  paymentDestination,
                  isDisabled
                })
              }

              return isDisabled
            })()}
            className={cn(
              'flex items-center justify-center w-full mx-auto h-14 text-lg font-semibold rounded-xl bg-linear-to-r from-slate-400 via-slate-400 to-rose-200 text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
              {
                'hover:from-slate-200 hover:to-rose-100':
                  !disabled &&
                  !activeIsConfirming &&
                  !activeIsPending &&
                  !hasInsufficientBalance &&
                  selectedToken &&
                  paymentAmountUsd &&
                  paymentDestination
              }
            )}>
            {activeIsPending || activeIsConfirming ? (
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <Icon name='mail-send' className='w-5 h-5' />
              </motion.div>
            ) : (
              <span className='flex items-center text-white opacity-100 gap-2 font-exo font-bold italic drop-shadow-2xs'>
                Pay
                <Icon name='send-block' className='w-5 h-5' />
              </span>
            )}
          </button>
        )}
      </motion.div>

      <ReceiptModal
        open={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        amount={successTokenAmountFormatted}
        symbol={displayTokenSymbol(lastPaymentToken)}
        usdValue={usdValue}
        hash={activeHash ?? null}
        explorerUrl={receiptExplorerUrl}
        recipient={null}
        blockNumber={activeReceipt?.blockNumber}
        timestamp={new Date().toISOString()}
      />
    </motion.div>
  )
}
