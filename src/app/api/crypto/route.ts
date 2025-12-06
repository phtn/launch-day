import { NextResponse } from 'next/server'
import type { CMCListingsResponse, CryptoApiResponse, CryptoQuote } from './types'

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'

export async function GET(): Promise<NextResponse<CryptoApiResponse>> {
  const apiKey = process.env.CMC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        timestamp: new Date().toISOString(),
        error: 'CMC_API_KEY is not configured'
      },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${CMC_API_URL}?start=1&limit=25&convert=USD`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        Accept: 'application/json'
      },
      next: {
        revalidate: 60 // Cache for 60 seconds
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('CoinMarketCap API error:', errorText)
      return NextResponse.json(
        {
          success: false,
          data: [],
          timestamp: new Date().toISOString(),
          error: `CoinMarketCap API returned ${response.status}`
        },
        { status: response.status }
      )
    }

    const cmcData: CMCListingsResponse = await response.json()

    if (cmcData.status.error_code !== 0) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          timestamp: new Date().toISOString(),
          error: cmcData.status.error_message ?? 'Unknown error from CoinMarketCap'
        },
        { status: 400 }
      )
    }

    const quotes: CryptoQuote[] = cmcData.data.map((crypto) => ({
      id: crypto.id,
      rank: crypto.cmc_rank,
      name: crypto.name,
      symbol: crypto.symbol,
      slug: crypto.slug,
      price: crypto.quote.USD.price,
      percentChange1h: crypto.quote.USD.percent_change_1h,
      percentChange24h: crypto.quote.USD.percent_change_24h,
      percentChange7d: crypto.quote.USD.percent_change_7d,
      marketCap: crypto.quote.USD.market_cap,
      volume24h: crypto.quote.USD.volume_24h,
      circulatingSupply: crypto.circulating_supply,
      maxSupply: crypto.max_supply,
      lastUpdated: crypto.quote.USD.last_updated,
      tags: crypto.tags
    }))

    return NextResponse.json({
      success: true,
      data: quotes,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching crypto quotes:', error)
    return NextResponse.json(
      {
        success: false,
        data: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch cryptocurrency data'
      },
      { status: 500 }
    )
  }
}
