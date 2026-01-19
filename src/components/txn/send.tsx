import { Balance } from '@/app/sepolia/content'
import { usePaste } from '@/hooks/use-paste'
import { Icon } from '@/lib/icons'
import { motion } from 'motion/react'
import { Dispatch, Ref, SetStateAction, useCallback, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { Title } from './components'
import { tokenData, TokenDisplay } from './token-display'

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
  setAmount: setAmountProp
}: SendTabProps) => {
  const [selectedToken] = useState('ETH')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSending] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

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

  const usdValue = useMemo(() => tokenPrice && parseFloat(amount) * tokenPrice, [amount, tokenPrice])

  const { paste } = usePaste({})

  const handlePaste = useCallback(async () => {
    const pastedText = await paste()
    if (pastedText) {
      setRecipient(pastedText)
      validateAddress(pastedText)
    }
  }, [paste])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-0'>
      {/* Token Selection */}
      <div className='mb-5'>
        <Title id='send-token-selector'>Tokens</Title>

        {balance && (
          <TokenDisplay
            token={balance.symbol}
            price={tokenPrice}
            balance={Number.parseFloat(formatUnits(balance.value, balance.decimals))}
            size='sm'
          />
        )}
        {/*<TokenSelector id='send-token-selector' selected={selectedToken} onSelect={setSelectedToken} />*/}
      </div>

      {/* Recipient Address */}
      <div className='mb-7'>
        <Title id='send-to'>To</Title>
        <div className='relative group'>
          <div
            className={`absolute inset-0 rounded-xl blur-md transition-opacity duration-300 ${
              isValid === true
                ? 'bg-emerald-400/40 opacity-100'
                : isValid === false
                ? 'bg-red-500/20 opacity-100'
                : 'opacity-0'
            }`}
          />
          <div
            className={`relative flex items-center md:gap-3 gap-1 p-1 md:p-4 rounded-xl bg-white/5 border transition-colors ${
              isValid === true
                ? 'border-emerald-200/50'
                : isValid === false
                ? 'border-red-500/50'
                : 'border-white/10 group-hover:border-white/20'
            }`}>
            <input
              id='send-to'
              type='text'
              ref={addressInputRef}
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value)
                setTo(e.target.value)
                validateAddress(e.target.value)
              }}
              spellCheck='false'
              placeholder='0x...'
              className='flex-1 p-2 bg-transparent text-white font-brk text-xs md:text-sm placeholder-white/30 outline-none'
            />
            {isValid !== null && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {isValid ? (
                  <Icon name='check' className='w-5 h-5 text-emerald-400' />
                ) : (
                  <Icon name='alert-02' className='w-5 h-5 text-red-400' />
                )}
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePaste}
              className='p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
              <Icon name='clipboard' className='w-4 h-4 text-white/60' />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className=''>
        <div className='flex justify-between items-center'>
          <Title id='send-amount'>amount</Title>
          <button
            onClick={() => formattedBalance && handleAmountChange(formattedBalance)}
            className='text-xs md:hover:text-indigo-300 transition-colors mr-4 mb-2'>
            <span className='uppercase font-bold text-indigo-200 '>Max</span>{' '}
            <span className='font-brk'>{formattedBalance}</span>
            <span className='opacity-50 ml-1'>{balance?.symbol}</span>
          </button>
        </div>
        <div className='rounded-xl bg-white/5 border border-white/10 space-y-0 overflow-hidden'>
          <div className='relative px-4 py-4'>
            <div className='absolute top-1.5 right-2 flex items-center gap-1'>
              <div className='w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse' />
              <span className='text-[9px] uppercase font-brk text-white/60'>Live</span>
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
              className='w-full bg-transparent text-2xl font-light text-white placeholder-white/20 outline-none'
            />
            <div
              className='absolute -bottom-0.5 -left-1.5 right-0 h-0.75 rounded-full transition-all duration-300'
              style={{
                background: amount ? `linear-gradient(30deg, ${data.color}, transparent)` : 'transparent'
              }}
            />
          </div>
          <div className='flex items-center justify-between pl-2 pb-2 bg-stone-950/80'>
            <div className='font-brk md:text-sm mt-2 flex items-center'>
              <span className='text-xl text-white/60 mr-1'>≈</span>
              <span className='text-teal-300/60 text-xs pr-0.5'>$</span>
              <span className='text-white/60 text-xs'>
                {usdValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className='flex items-center font-brk gap-1.5 pr-1 mt-2'>
              <span className='hidden text-[11px] uppercase tracking-wide'>
                <span className=' text-white/50 tracking-tight mr-1'>Net fee:</span>
                <span className='opacity-80'>0.0012</span>
                <span className='opacity-50 tracking-tight'>ETH · </span>
                <span className='text-teal-300/60 font-sans pr-px text-xs'>$</span>
                <span className='opacity-100'>3.89</span>
              </span>
            </div>
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
            className='py-2 rounded-lg bg-stone-200/25 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all'>
            <span>{percent}</span>
            <span className='text-[9px] opacity-60'>%</span>
          </motion.button>
        ))}
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
          <span className='text-white/50 font-brk'>Estimated Network Fee</span>
          <span className='text-white font-medium'>
            ~0.0012 ETH (<span className='text-teal-300/60 pr-0.5'>$</span>3.89)
          </span>
        </div>
      </div>

      {/* Send Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='mt-4'>
        <button
          onClick={onSend}
          disabled={disabled}
          className='flex items-center justify-center w-full mx-auto h-14 text-lg font-semibold rounded-xl bg-linear-to-r from-slate-400 via-rose-300 to-rose-400 hover:from-slate-200 hover:to-rose-300 text-white border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'>
          {isSending ? (
            <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <Icon name='mail-send' className='w-5 h-5' />
            </motion.div>
          ) : (
            <span className='flex items-center gap-2'>
              Send
              <Icon name='square-arrow-up-right' className='w-5 h-5' />
            </span>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}
