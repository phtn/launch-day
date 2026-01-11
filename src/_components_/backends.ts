import { StarlinkData } from '@/app/types'

export const backends: StarlinkData[] = [
  {
    id: 0,
    col: 1,
    sector: 2,
    row: 'top',
    label: 'firebase',
    description: "Google's backend-as-a-service platform",
    href: 'https://console.firebase.google.com/u/0/',
    icon: 'firebase'
  },
  {
    id: 1,
    col: 2,
    sector: 2,
    row: 'top',
    label: 'convex',
    description: 'Real-time backend for modern applications',
    href: 'https://dashboard.convex.dev',
    icon: 'cloud-lightning'
  },
  {
    id: 2,
    col: 3,
    sector: 2,
    row: 'top',
    label: 'doctl',
    description: 'DigitalOcean cloud infrastructure platform',
    href: 'https://cloud.digitalocean.com/',
    icon: 'doctl'
  },
  {
    id: 3,
    col: 4,
    sector: 2,
    row: 'top',
    label: 'sepolia',
    description: 'Google Sepolia Faucet',
    href: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    icon: 'ethereum'
  },
  {
    id: 4,
    sector: 2,
    row: 'middle',
    col: 1,
    label: 'redis',
    description: 'In-memory data structure store and cache',
    href: 'https://cloud.redis.io/',
    icon: 'redis'
  },
  {
    id: 5,
    col: 2,
    sector: 2,
    row: 'middle',
    label: 'gcp',
    description: 'Google Cloud Platform services',
    href: 'https://console.cloud.google.com/',
    icon: 'gcp'
  },
  {
    id: 6,
    col: 3,
    sector: 2,
    row: 'middle',
    label: 'supabase',
    description: 'Open source Firebase alternative with PostgreSQL',
    href: 'https://supabase.com/dashboard/projects',
    icon: 'supabase'
  },
  {
    id: 10,
    col: 4,
    sector: 2,
    row: 'middle',
    label: 'cloudinary',
    description: 'Cloudinary',
    href: 'https://console.cloudinary.com/app',
    icon: 'cloudinary',
    posX: 338,
    posY: 326
  },
  {
    id: 9,
    col: 5,
    sector: 2,
    row: 'middle',
    label: '3000',
    description: 'Local development server (HTTPS)',
    href: 'https://localhost:3000',
    icon: 'secured-server'
  },
  {
    id: 7,
    col: 2,
    sector: 2,
    row: 'bottom',
    label: 'v0',
    description: 'AI-powered UI component generator by Vercel',
    href: 'http://v0.dev',
    icon: 'v0'
  },
  {
    id: 8,
    col: 3,
    sector: 2,
    row: 'bottom',
    label: '3000',
    description: 'Local development server (HTTP)',
    href: 'http://localhost:3000',
    icon: 'localhost'
  },
  {
    id: 12,
    col: 4,
    sector: 2,
    row: 'bottom',
    label: '3001',
    description: 'Alternative local development server (HTTP)',
    href: 'http://localhost:3001',
    icon: 'localhost'
  },
  {
    id: 13,
    col: 5,
    sector: 2,
    row: 'bottom',
    label: '3001',
    description: 'Alternative local development server (HTTPS)',
    href: 'https://localhost:3001',
    icon: 'secured-server'
  }
]
