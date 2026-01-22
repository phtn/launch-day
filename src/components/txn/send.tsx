import { usePaste } from '@/hooks/use-paste'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ChangeEvent, Dispatch, Ref, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { AmountInputField } from './amount-input'
import { AddressInputField, Title } from './components'
import { tokenData, TokenDisplay } from './token-display'
import { TransactionHashLink } from './transaction-hash-link'
import { Balance } from './types'

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
            <span className='text-xs font-brk text-white/80 truncate max-w-50'>{recipient}</span>
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
            <span className='text-xs font-brk text-white/80 truncate max-w-50'>{recipient}</span>
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

  const handleOnChangeAddress = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRecipient(e.target.value)
      setTo(e.target.value)
      validateAddress(e.target.value)
    },
    [setRecipient, setTo]
  )

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
      <AddressInputField
        label='To'
        isValid={isValid}
        value={recipient}
        pasteFn={handlePaste}
        inputRef={addressInputRef}
        onChange={handleOnChangeAddress}
      />

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
            <AmountInputField
              balance={balance}
              tokenData={data}
              usdValue={usdValue}
              formattedBalance={formattedBalance}
              onChange={handleAmountChange}
              amountInputRef={amountInputRef}
            />
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
