import { usePaste } from '@/hooks/use-paste'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Dispatch, Ref, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { Title, USDValue } from './components'
import { tokenData, TokenDisplay } from './token-display'

export interface Balance {
  value: bigint
  symbol: string
  decimals: number
}

interface SendingStateProps {
  amount: string
  recipient: string
  balance: Balance | null
  usdValue: number | null
}

const SendingState = ({ amount, recipient, balance, usdValue }: SendingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='rounded-xl bg-white/5 border border-white/10 space-y-0 overflow-hidden'>
      <div className='relative px-4 py-6'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='w-12 h-12 rounded-full border-2 border-rose-300/30 border-t-rose-300 flex items-center justify-center'>
            <Icon name='mail-send' className='w-6 h-6 text-rose-300' />
          </motion.div>
          <div className='text-center space-y-1'>
            <p className='text-sm font-brk text-white/80'>Sending Transaction</p>
            <p className='text-xs font-brk text-white/50'>Please confirm in your wallet</p>
          </div>
        </div>
        <div className='mt-6 pt-4 border-t border-white/10 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-brk text-white/50'>To</span>
            <span className='text-xs font-mono font-brk text-white/80 truncate max-w-[200px]'>{recipient}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-brk text-white/50'>Amount</span>
            <div className='text-right'>
              <span className='text-sm font-brk text-white'>
                {amount} {balance?.symbol ?? 'ETH'}
              </span>
              {usdValue !== null && (
                <p className='text-xs font-brk text-white/50'>
                  ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
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
  amount: string
  recipient: string
  balance: Balance | null
  usdValue: number | null
  hash: `0x${string}` | null
  explorerUrl: string | null
}

const SuccessState = ({ amount, recipient, balance, usdValue, hash, explorerUrl }: SuccessStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className='rounded-xl bg-emerald-500/10 border border-emerald-400/30 space-y-0 overflow-hidden'>
      <div className='relative px-4 py-6'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className='w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center'>
            <Icon name='check' className='w-6 h-6 text-emerald-400' />
          </motion.div>
          <div className='text-center space-y-1'>
            <p className='text-sm font-brk text-emerald-300'>Transaction Successful</p>
            <p className='text-xs font-brk text-white/60'>Your transaction has been confirmed</p>
          </div>
        </div>
        <div className='mt-6 pt-4 border-t border-emerald-400/20 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-brk text-white/50'>To</span>
            <span className='text-xs font-mono font-brk text-white/80 truncate max-w-[200px]'>{recipient}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-brk text-white/50'>Amount</span>
            <div className='text-right'>
              <span className='text-sm font-brk text-white'>
                {amount} {balance?.symbol ?? 'ETH'}
              </span>
              {usdValue !== null && (
                <p className='text-xs font-brk text-white/50'>
                  ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              )}
            </div>
          </div>
          {hash && (
            <div className='flex items-center justify-between pt-2'>
              <span className='text-xs font-brk text-white/50'>Transaction</span>
              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs font-mono font-brk text-emerald-300 hover:text-emerald-200 underline truncate max-w-[200px]'>
                  {hash.substring(0, 10)}...
                </a>
              ) : (
                <span className='text-xs font-mono font-brk text-white/60 truncate max-w-[200px]'>
                  {hash.substring(0, 10)}...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

type ReceiptStatus = { blockNumber: bigint; status: 'success' | 'reverted' } | null

interface SendTabProps {
  onSend: VoidFunction
  formattedBalance: string | null
  balance: Balance | null
  tokenPrice: number | null
  disabled: boolean
  amountInputRef: Ref<HTMLInputElement>
  addressInputRef: Ref<HTMLInputElement>
  setTo: Dispatch<SetStateAction<string>>
  setAmount: Dispatch<SetStateAction<string>>
  to: string
  amount: string
  isPending?: boolean
  isConfirming?: boolean
  receipt?: ReceiptStatus
  hash?: `0x${string}` | null
  explorerUrl?: string | null
  onReset?: VoidFunction
}
export const SendTab = ({
  formattedBalance,
  balance,
  tokenPrice,
  disabled,
  onSend,
  amountInputRef,
  addressInputRef,
  setTo,
  setAmount: setAmountProp,
  to: toProp,
  amount: amountProp,
  isPending = false,
  isConfirming = false,
  receipt = null,
  hash = null,
  explorerUrl = null,
  onReset
}: SendTabProps) => {
  const [selectedToken] = useState('ETH')
  const [recipient, setRecipient] = useState(toProp)
  const [amount, setAmount] = useState(amountProp)
  const [isSending] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  // Sync local state with parent props
  useEffect(() => {
    setRecipient(toProp)
  }, [toProp])

  useEffect(() => {
    setAmount(amountProp)
  }, [amountProp])

  // Sync amount to parent
  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value)
      setAmountProp(value)
    },
    [setAmountProp]
  )

  const data = tokenData[selectedToken] || { color: '#6366f1' }

  // Get actual balance from props
  const actualBalance = useMemo(() => {
    if (!balance) return null
    return Number.parseFloat(formatUnits(balance.value, balance.decimals))
  }, [balance])

  const validateAddress = (address: string) => {
    if (!address) {
      setIsValid(null)
      return
    }
    // Simple validation - starts with 0x and has 40+ chars
    setIsValid(address.startsWith('0x') && address.length >= 40)
  }

  const usdValue = useMemo(() => {
    if (!tokenPrice || !amount) return null
    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return null
    return parsedAmount * tokenPrice
  }, [amount, tokenPrice])

  const { paste } = usePaste({})

  const handlePaste = useCallback(async () => {
    const pastedText = await paste()
    if (pastedText) {
      setRecipient(pastedText)
      setTo(pastedText)
      validateAddress(pastedText)
    }
  }, [paste, setTo])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-0'>
      {/* Token Selection */}
      <div className='mb-5'>
        <Title id='send-token-selector'>Token</Title>
        <div className='mt-2'>
          {balance && (
            <TokenDisplay
              token={balance.symbol}
              price={tokenPrice}
              balance={Number.parseFloat(formatUnits(balance.value, balance.decimals))}
              size='sm'
            />
          )}
        </div>
        {/*<TokenSelector id='send-token-selector' selected={selectedToken} onSelect={setSelectedToken} />*/}
      </div>

      {/* Recipient Address */}
      <div className='mb-7'>
        <Title id='send-to'>To</Title>
        <div className='relative group mt-2'>
          <div
            className={`absolute inset-0 rounded-xl blur-md transition-opacity duration-300 ${
              isValid === true
                ? 'bg-linear-to-r from-emerald-500/5 to-emerald-400/5'
                : isValid === false
                ? 'bg-red-500/20 opacity-100'
                : 'opacity-0'
            }`}
          />
          <div
            className={`relative flex items-center md:gap-0 gap-0 p-1 md:p-3 rounded-xl bg-white/5 border transition-colors ${
              isValid === true
                ? 'border-emerald-400/50'
                : isValid === false
                ? 'border-red-500/50'
                : 'border-white/10 group-hover:border-white/20'
            }`}>
            <input
              type='text'
              id='send-to'
              value={recipient}
              spellCheck='false'
              placeholder='0x...'
              ref={addressInputRef}
              onChange={(e) => {
                setRecipient(e.target.value)
                setTo(e.target.value)
                validateAddress(e.target.value)
              }}
              className='flex-1 p-2 bg-transparent text-white font-brk text-xs md:text-sm placeholder-white/30 outline-none'
            />
            {isValid !== null && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {isValid ? (
                  <Icon name='check' className='size-4 text-emerald-400' />
                ) : (
                  <Icon name='alert-02' className='size-4 text-red-400' />
                )}
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePaste}
              className='p-2 rounded-lg bg-white/0 hover:bg-white/5 transition-colors'>
              <Icon name='clipboard' className='size-5 text-white/60' />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Amount Input / Sending / Success State */}
      <div className=''>
        <AnimatePresence mode='wait'>
          {receipt && receipt.status === 'success' ? (
            <SuccessState
              key='success'
              amount={amount}
              recipient={recipient}
              balance={balance}
              usdValue={usdValue}
              hash={hash}
              explorerUrl={explorerUrl}
            />
          ) : isPending || isConfirming ? (
            <SendingState key='sending' amount={amount} recipient={recipient} balance={balance} usdValue={usdValue} />
          ) : (
            <motion.div key='input' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className='flex justify-between items-center'>
                <Title id='send-amount'>amount</Title>
                <button
                  onClick={() => formattedBalance && handleAmountChange(formattedBalance)}
                  className='text-xs md:hover:text-indigo-300 transition-colors mr-4 mb-2'>
                  <span className='uppercase font-okxs font-bold text-indigo-200'>Max</span>{' '}
                  <span className='font-okxs'>{formattedBalance}</span>
                  <span className='font-okxs font-light opacity-50 ml-1'>{balance?.symbol}</span>
                </button>
              </div>
              <div className='space-y-0 overflow-hidden'>
                <div
                  className='relative rounded-2xl border border-zinc-700 overflow-hidden'
                  style={{
                    backgroundColor: `${data?.color ?? '#000'}5`,
                    borderColor: `${data?.color ?? '#000'}40`
                  }}>
                  {/* Crypto gradient accent */}
                  <div
                    id='crypto-gradient-accent'
                    style={{ backgroundColor: data?.color ?? '#000', filter: 'blur(64px)' }}
                    className='absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20'
                  />

                  <div className='relative px-4 py-4'>
                    {' '}
                    <div className='absolute top-2 right-2.5 flex items-center gap-1'>
                      <div className='w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse' />
                      <span className='text-[9px] md:text-[8px] uppercase font-brk text-white/60'>Live</span>
                    </div>
                    <input
                      id='send-amount'
                      ref={amountInputRef}
                      type='number'
                      value={amount}
                      onChange={(e) => {
                        handleAmountChange(e.target.value)
                      }}
                      placeholder='0.00'
                      className='w-full bg-transparent text-2xl font-okxs font-light text-white placeholder-white/20 outline-none'
                    />
                    <div
                      className='absolute -bottom-px left-0 right-0 h-px rounded-full transition-all duration-300'
                      style={{
                        background: amount ? `linear-gradient(30deg, ${data.color}80, transparent)` : 'transparent'
                      }}
                    />
                  </div>
                  <div className='flex items-center justify-between h-10 pl-4 pb-2'>
                    {usdValue !== null && <USDValue value={usdValue} />}
                  </div>
                </div>
              </div>
              {/* Quick Amount Buttons */}
              <div className='grid grid-cols-4 gap-2 mb-4 mt-6'>
                {[25, 50, 75, 100].map((percent) => (
                  <motion.button
                    key={percent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (formattedBalance) {
                        handleAmountChange(((+formattedBalance * percent) / 100).toFixed(6))
                      }
                    }}
                    className='py-2 font-okxs font-bold rounded-lg bg-zinc-100/20 border border-zinc-200/15 text-white/70 text-sm hover:bg-zinc-100/5 hover:text-white transition-all'>
                    <span className='font-exo'>{percent}</span>
                    <span className='text-xs'>%</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning for high amount */}
      {actualBalance !== null && amount && parseFloat(amount) > actualBalance && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2'>
          <Icon name='alert-02' className='w-4 h-4 text-red-400 shrink-0' />
          <p className='text-sm text-red-300'>Insufficient balance for this transaction</p>
        </motion.div>
      )}

      {/* Network Fee Info */}
      <div className='p-4 rounded-xl bg-white/0 border border-white/0'>
        <div className='flex items-center justify-between text-xs md:text-sm'>
          <span className='opacity-70 font-exo font-bold uppercase italic'>Estimated Network Fee</span>
          <span className='text-white font-okxs'>
            ~0.0012 <span className='font-okxs font-light opacity-70'>ETH</span> ({' '}
            <span className='opacity-60 pr-0.5'>$</span>3.89 )
          </span>
        </div>
      </div>

      {/* Send Button / Send Another Button */}
      <motion.div
        whileHover={{ scale: disabled || isConfirming ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='mt-4'>
        {receipt && receipt.status === 'success' && onReset ? (
          <button
            onClick={onReset}
            className='flex items-center justify-center w-full mx-auto h-14 text-lg font-semibold rounded-xl bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-white border-0 shadow-lg transition-all'>
            <span className='flex items-center gap-2'>
              Send Another
              <Icon name='arrow-right-02' className='w-5 h-5' />
            </span>
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={disabled || isConfirming}
            className={cn(
              'flex items-center justify-center w-full mx-auto h-14 text-lg font-semibold rounded-xl bg-linear-to-r from-slate-300 via-rose-300 to-rose-300 text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
              { 'hover:from-slate-200 hover:to-rose-300': !disabled && !isConfirming }
            )}>
            {isPending || isConfirming ? (
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <Icon name='mail-send' className='w-5 h-5' />
              </motion.div>
            ) : (
              <span className='flex items-center gap-2 font-exo font-bold italic drop-shadow-2xs'>
                Send
                <Icon name='send-block' className='w-5 h-5' />
              </span>
            )}
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
