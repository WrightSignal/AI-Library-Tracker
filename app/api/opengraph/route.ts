import { NextRequest, NextResponse } from 'next/server'
import { fetchOpenGraphDataServer } from '@/lib/opengraph'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('API: Fetching OpenGraph data for:', url)
    const result = await fetchOpenGraphDataServer(url)

    // result.data now includes favicon_url

    return NextResponse.json(result)
  } catch (error) {
    console.error('API: Error in OpenGraph route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with URL in body.' },
    { status: 405 }
  )
} 