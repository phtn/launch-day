import { Navbar } from '@/_components_/navbar'
import { Providers } from '@/ctx/providers'
import { DynamicWagmiContext } from '@/ctx/wagmi/dynamic'
import { Metadata } from 'next'
import { Abril_Fatface, Bakbak_One, Exo_2, Figtree, Geist, Space_Grotesk } from 'next/font/google'
import { headers } from 'next/headers'
import { type ReactNode } from 'react'
import './globals.css'

const exo = Exo_2({
  variable: '--font-exo',
  weight: ['400', '900'],
  subsets: ['latin']
})

const abril = Abril_Fatface({
  variable: '--font-abril',
  weight: ['400'],
  subsets: ['latin']
})

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const figtree = Figtree({
  variable: '--font-figtree',
  weight: ['400', '900'],
  subsets: ['latin']
})

const bone = Bakbak_One({
  variable: '--font-bone',
  weight: ['400'],
  subsets: ['latin']
})

const space = Space_Grotesk({
  variable: '--font-space',
  weight: ['400'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Launch Day',
  description: 'Dev Launcher',
  icons: ['/svg/logomark.svg']
}

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${space.variable} ${bone.variable} ${figtree.variable} ${geist.variable} ${abril.variable} ${exo.variable} font-sans antialiased`}>
        <DynamicWagmiContext cookies={cookies}>
          <Providers>
            <div className='bg-gray-900'>
              <Navbar />
              <main className='bg-gray-950 h-screen overflow-hidden'>{children}</main>
            </div>
          </Providers>
        </DynamicWagmiContext>
      </body>
    </html>
  )
}
