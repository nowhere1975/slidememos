export interface URLParseResult {
  title?: string
  favicon?: string
  ogDescription?: string
}

/** Parse URL metadata using fetch (P2 strategy) */
export async function parseURL(url: string): Promise<URLParseResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'text/html' },
    })

    if (!response.ok) {
      return fallbackParse(url)
    }

    const html = await response.text()
    return extractMetadata(html, url)
  } catch {
    // P3 fallback: CORS or network error
    return fallbackParse(url)
  }
}

/** Extract metadata from HTML */
function extractMetadata(html: string, url: string): URLParseResult {
  const result: URLParseResult = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
  }

  // Extract og:title (higher priority)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (ogTitleMatch) {
    result.title = ogTitleMatch[1].trim()
  }

  // Extract og:description
  const ogDescMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
  )
  if (ogDescMatch) {
    result.ogDescription = ogDescMatch[1].trim()
  }

  // Extract favicon
  const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
  if (faviconMatch) {
    result.favicon = new URL(faviconMatch[1], url).href
  } else {
    result.favicon = new URL('/favicon.ico', url).href
  }

  return result
}

/** P3 fallback: generate basic info from URL */
function fallbackParse(url: string): URLParseResult {
  const urlObj = new URL(url)
  return {
    title: urlObj.hostname,
    favicon: `${urlObj.origin}/favicon.ico`,
  }
}

/** Parse URL from active tab using scripting API (P1 strategy) */
export async function parseActiveTab(): Promise<URLParseResult & { url: string }> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const tab = tabs[0]

  if (!tab?.id || !tab.url) {
    throw new Error('No active tab')
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const getMeta = (name: string) => {
        const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)
        return el?.getAttribute('content') || undefined
      }

      const favicon =
        (document.querySelector('link[rel*="icon"]') as HTMLLinkElement)?.href ||
        `${window.location.origin}/favicon.ico`

      return {
        title: getMeta('og:title') || document.title,
        ogDescription: getMeta('og:description') || getMeta('description'),
        favicon,
        url: window.location.href,
      }
    },
  })

  return results[0].result as URLParseResult & { url: string }
}
