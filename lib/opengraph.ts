export interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
  type?: string
  favicon_url?: string
}

export interface OpenGraphResponse {
  success: boolean
  data?: OpenGraphData
  error?: string
}

/**
 * Fetches OpenGraph metadata for a given URL using OpenGraph.io API
 */
export async function fetchOpenGraphData(url: string): Promise<OpenGraphResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENGRAPH_API_KEY || process.env.OPENGRAPH_API_KEY
    
    if (!apiKey) {
      console.warn('OpenGraph API key not found')
      return {
        success: false,
        error: 'OpenGraph API key not configured'
      }
    }

    // OpenGraph.io API endpoint format (commonly used pattern)
    const apiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=${apiKey}`
    
    console.log('Fetching OpenGraph data for:', url)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SP-AI-Library/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`OpenGraph API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // Handle different possible response formats
    const ogData = result.hybridGraph || result.openGraph || result
    
    return {
      success: true,
      data: {
        title: ogData.title || ogData.og_title,
        description: ogData.description || ogData.og_description,
        image: ogData.image || ogData.og_image,
        siteName: ogData.site_name || ogData.og_site_name,
        url: ogData.url || url,
        type: ogData.type || ogData.og_type
      }
    }
  } catch (error) {
    console.error('Error fetching OpenGraph data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Server-side function to fetch OpenGraph data (for API routes)
 */
export async function fetchOpenGraphDataServer(url: string): Promise<OpenGraphResponse> {
  try {
    const apiKey = process.env.OPENGRAPH_API_KEY
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenGraph API key not configured'
      }
    }

    const apiUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=${apiKey}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SP-AI-Library/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`OpenGraph API error: ${response.status}`)
    }

    const result = await response.json()
    const ogData = result.hybridGraph || result.openGraph || result
    
    // Get favicon URL
    const favicon_url = await getFaviconUrl(url)
    
    return {
      success: true,
      data: {
        title: ogData.title || ogData.og_title,
        description: ogData.description || ogData.og_description,
        image: ogData.image || ogData.og_image,
        siteName: ogData.site_name || ogData.og_site_name,
        url: ogData.url || url,
        type: ogData.type || ogData.og_type,
        favicon_url,
      }
    }
  } catch (error) {
    console.error('Server: Error fetching OpenGraph data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Validates if a URL is suitable for OpenGraph scraping
 */
export function isValidUrlForScraping(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Only allow http/https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
} 

export async function getFaviconUrl(siteUrl: string): Promise<string> {
  try {
    const urlObj = new URL(siteUrl)
    // Use DuckDuckGo's favicon service (reliable, supports .ico, .png, .svg)
    return `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`
  } catch {
    return ''
  }
} 