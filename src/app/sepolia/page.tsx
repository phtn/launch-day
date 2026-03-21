import { Metadata } from 'next'
import { Haul } from './haul'

export const metadata: Metadata = {
  title: 'MadStax',
  description: 'Send and Recieve Crypto.'
}
export default function Page() {
  return <Haul />
}
