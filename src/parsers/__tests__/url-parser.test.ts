import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseURL, parseActiveTab, type URLParseResult } from '../url-parser'

describe('url-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseURL', () => {
    it('should extract title, favicon and og:description from HTML', async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Page Title</title>
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
            <link rel="icon" href="/favicon.ico">
          </head>
        </html>
      `
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(html),
      } as Response)

      const result = await parseURL('https://example.com')

      expect(result.title).toBe('OG Title') // og:title takes precedence
      expect(result.ogDescription).toBe('OG Description')
      expect(result.favicon).toBe('https://example.com/favicon.ico')
    })

    it('should fallback to URL hostname when fetch fails (CORS)', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('CORS error'))

      const result = await parseURL('https://blocked-site.com/path')

      expect(result.title).toBe('blocked-site.com')
      expect(result.favicon).toBe('https://blocked-site.com/favicon.ico')
    })

    it('should fallback when response is not ok (404/500)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      } as Response)

      const result = await parseURL('https://example.com/not-found')

      expect(result.title).toBe('example.com')
    })

    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = '<html><head><title>No closing tags'
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(malformedHtml),
      } as Response)

      const result = await parseURL('https://example.com')

      // Should still extract what it can
      expect(result.title || result.favicon).toBeDefined()
    })

    it('should resolve relative favicon URLs to absolute', async () => {
      const html = `
        <html>
          <head>
            <link rel="icon" href="/assets/favicon.png">
          </head>
        </html>
      `
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(html),
      } as Response)

      const result = await parseURL('https://example.com/page')

      expect(result.favicon).toBe('https://example.com/assets/favicon.png')
    })

    it('should use shortcut icon if no regular icon', async () => {
      const html = `
        <html>
          <head>
            <link rel="shortcut icon" href="/favicon.ico">
          </head>
        </html>
      `
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(html),
      } as Response)

      const result = await parseURL('https://example.com')

      expect(result.favicon).toBe('https://example.com/favicon.ico')
    })

    it('should default to /favicon.ico when no icon link found', async () => {
      const html = '<html><head><title>Test</title></head></html>'
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(html),
      } as Response)

      const result = await parseURL('https://example.com')

      expect(result.favicon).toBe('https://example.com/favicon.ico')
    })
  })

  describe('parseActiveTab', () => {
    it('should extract metadata from active tab via scripting API', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
      }
      vi.mocked(chrome.tabs.query).mockResolvedValue([mockTab] as chrome.tabs.Tab[])

      const mockResult = {
        title: 'Page Title',
        ogDescription: 'Page Description',
        favicon: 'https://example.com/favicon.ico',
        url: 'https://example.com/page',
      }
      vi.mocked(chrome.scripting.executeScript).mockResolvedValue([
        { result: mockResult },
      ] as chrome.scripting.InjectionResult<unknown>[])

      const result = await parseActiveTab()

      expect(result.title).toBe('Page Title')
      expect(result.url).toBe('https://example.com/page')
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true })
    })

    it('should throw error when no active tab', async () => {
      vi.mocked(chrome.tabs.query).mockResolvedValue([] as chrome.tabs.Tab[])

      await expect(parseActiveTab()).rejects.toThrow('No active tab')
    })

    it('should throw error when tab has no URL', async () => {
      const mockTab = { id: 123 } // no url
      vi.mocked(chrome.tabs.query).mockResolvedValue([mockTab] as chrome.tabs.Tab[])

      await expect(parseActiveTab()).rejects.toThrow('No active tab')
    })
  })
})
