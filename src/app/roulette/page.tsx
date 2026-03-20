import RouletteGame from './content'
import { getRouletteServerState } from '@/lib/roulette/server'

const Page = async () => {
  const initialState = await getRouletteServerState()
  return <RouletteGame initialState={initialState} />
}

export default Page
