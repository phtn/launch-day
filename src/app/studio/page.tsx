import { Metadata } from 'next'
import { Content } from './content'

export const metadata: Metadata = {
  title: 'title',
  description: 'description',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      sizes: '450x150',
      url: '/svg/black-slot.svg'
    }
  ]
}
const Page = async () => <Content />
export default Page
