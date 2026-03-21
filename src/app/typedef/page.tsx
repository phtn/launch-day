import { Metadata } from 'next'
import { Content } from './content'

export const metadata: Metadata = {
  title: 'Type Definition',
  description: 'Generate TypeScript definitions from JSON'
}

const Page = async () => <Content />
export default Page
