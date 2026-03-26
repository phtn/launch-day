import { Metadata } from 'next'
import { Content } from './sonic-content'

export const metadata: Metadata = {
  title: 'Sonic',
  description: 'Audio Converter'
}
const Page = async () => <Content />
export default Page
