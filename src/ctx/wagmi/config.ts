import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  base,
  baseSepolia,
  mainnet,
  polygon,
  polygonAmoy,
  polygonZkEvmTestnet,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
  zeroGTestnet
} from '@reown/appkit/networks'
import { cookieStorage, createStorage } from '@wagmi/core'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_ID as string

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [
  sepolia,
  baseSepolia,
  mainnet,
  base,
  polygon,
  polygonAmoy,
  polygonZkEvmTestnet,
  zeroGTestnet,
  solanaTestnet,
  solanaDevnet,
  solana
]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
