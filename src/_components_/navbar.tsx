'use client'

import { config } from '@/ctx/wagmi/config'
import { useCrypto } from '@/hooks/use-crypto'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useAppKitAccount } from '@reown/appkit/react'
import { getBalance } from '@wagmi/core'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import { Brand } from './brand'

export const Navbar = () => {
  const { address } = useAppKitAccount()
  const { getBySymbol } = useCrypto()

  const getBal = useCallback(async () => {
    const balance = await getBalance(config, {
      address: address as `0x${string}`,
      chainId: chainMap['eth']
    })
    // formatUnits converts wei → human-readable string
    const formattedBal = formatUnits(balance.value, balance.decimals)
    const balanceAsNumber = Number(formattedBal)

    const currentPrice = getBySymbol(balance.symbol)?.price

    if (!currentPrice) {
      return null
    }

    const usdValue = balanceAsNumber * currentPrice
    console.log('Balance (ETH):', balanceAsNumber)
    console.log('USD Value:', usdValue)
    console.table({ 'Balance (ETH)': balanceAsNumber, 'USD Value': usdValue, symbol: balance.symbol })

    return usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      unitDisplay: 'narrow',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      currencyDisplay: 'symbol'
    })
  }, [address, getBySymbol])

  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (address && !balance) {
      getBal().then(setBalance).catch(console.error)
    }
  }, [address, balance, getBal])

  return (
    <nav className='z-200 md:h-16 h-12 border-b border-base-300 w-full justify-between bg-black/80 backdrop-blur-2xl hover:bg-black hover:backdrop-blur-2xl fixed top-0 flex items-center gap-8 ps-2 md:px-8'>
      <Brand title='Launch Day' />
      <div
        className={cn('flex items-center space-x-4 transition-transform', {
          'portrait:translate-x-30': balance !== null
        })}>
        <button className='btn btn-ghost hover:bg-transparent'>
          {balance ? (
            <label className='swap swap-flip'>
              <input type='checkbox' defaultChecked />
              <div className='font-space text-lg swap-on flex items-center'>{balance}</div>
              <div className='flex items-center font-space text-lg swap-off'>
                <div>$</div> <div className='text-2xl mt-2 pl-1'>*****</div>
              </div>
            </label>
          ) : (
            <Icon name='spinner-ring' className={cn('size-3 opacity-80 text-orange-300')} />
          )}
        </button>
        <WalletConnector />
      </div>
    </nav>
  )
}

const WalletConnector = () => {
  return (
    <div className='items-center flex justify-end text-xs md:justify-center md:space-x-4'>
      <w3m-button balance='hide' loadingLabel='Connecting...' size='sm' label='→' />
    </div>
  )
}

export const ModeSwitch = () => {
  const { setTheme } = useTheme()
  const handleThemeSet = useCallback(
    (theme: string) => async () => {
      setTheme(theme)
    },
    [setTheme]
  )
  return (
    <div className='flex items-center gap-2'>
      <button onClick={handleThemeSet('light')} className='text-gray-200'>
        Light
      </button>
      <button onClick={handleThemeSet('dark')} className='text-gray-200'>
        Dark
      </button>
    </div>
  )
}

const chainMap = {
  eth: 11155111
}
