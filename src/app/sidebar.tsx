import { HyperList } from '@/_components_/hyperlist'
import { Icon, IconName } from '@/lib/icons'
import Link from 'next/link'

export const Sidebar = () => {
  const data: Array<SidebarItem> = [
    { id: '1', label: 'Roulette', description: 'Play for fun', href: '/roulette', icon: 'gamepad' },
    { id: '2', label: 'Crypto', description: 'Trends & Prices', href: '/crypto', icon: 'pyramid-chart' },
    { id: '3', label: 'Icons', description: 'Icon Sets', href: '/icons', icon: 'line' },
    { id: '4', label: 'Imager', description: 'Convert Images', href: '/image-converter', icon: 'img-rol-line' },
    { id: '5', label: 'ToneJS', description: 'Synths', href: '/tone', icon: 'piano' },
    { id: '6', label: 'Sepolia', description: 'Send, Receive, Swap', href: '/sepolia', icon: 'ethereum' }
  ]
  return (
    <div className='col-span-3 h-full w-full flex justify-center p-2 md:p-2'>
      <div className='h-fit w-full p-2 md:p-4 mt-16'>
        <ListComponent data={data} label='Games' />
      </div>
    </div>
  )
}

interface ListComponentProps {
  data: Array<SidebarItem>
  label?: string
}
const ListComponent = ({ data }: ListComponentProps) => {
  return (
    <ul className='list lg:bg-base-100/60 rounded-box shadow-md overflow-hidden'>
      <li key='list-title' className='p-0.5 lg:p-2 xl:p-4 pb-2 text-xs opacity-60 tracking-wide'>
        <ListTitle />
      </li>
      <HyperList data={data} component={ListItem} />
    </ul>
  )
}

const ListTitle = () => (
  <span className='text-rotate text-xs'>
    <span className='justify-items-start'>
      <span>TOOLS</span>
      <span>GAMES</span>
      <span>EXPERIMENTS</span>
      <span>WORK</span>
    </span>
  </span>
)

interface SidebarItem {
  id: string
  label: string
  description: string
  href: string
  icon: IconName
}
const ListItem = (item: SidebarItem) => (
  <Link
    href={item.href}
    prefetch
    className='list-row portrait:px-0.5 portrait:py-2 group flex justify-between transition-colors duration-300'>
    <div className='portrait:hidden text-xl font-light tabular-nums whitespace-nowrap group-hover:text-orange-200 opacity-30 group-hover:opacity-100'>
      <span className=''>0{item.id}</span>
    </div>
    <div className='list-col-grow w-full flex items-center md:space-x-2'>
      <div className='text-base whitespace-nowrap'>{item.label}</div>
      <div className='hidden xl:flex text-xs opacity-45 font-light font-sans'>{item.description}</div>
    </div>
    <Icon name={item.icon} className='hidden lg:flex size-6 text-orange-200' />
  </Link>
)
