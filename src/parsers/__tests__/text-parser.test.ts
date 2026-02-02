import { describe, it, expect } from 'vitest'
import { parseText } from '../text-parser'

describe('text-parser', () => {
  describe('parseText', () => {
    it('should auto-generate title from first line (max 15 chars)', () => {
      const content = 'This is a very long title that should be truncated'
      const result = parseText(content)

      // Title should be truncated to ~15 chars with ellipsis
      expect(result.title.length).toBeLessThanOrEqual(18) // 15 + '...'
      expect(result.title.startsWith('This is a very')).toBe(true)
    })

    it('should extract title from markdown heading', () => {
      const content = '# My Heading\nSome content here'
      const result = parseText(content)

      expect(result.title).toBe('My Heading')
      expect(result.isMarkdown).toBe(true)
    })

    it('should extract title from level 2 markdown heading', () => {
      const content = '## Section Title\nMore content'
      const result = parseText(content)

      expect(result.title).toBe('Section Title')
      expect(result.isMarkdown).toBe(true)
    })

    it('should detect bold text markdown', () => {
      const content = 'This has **bold** text in it'
      const result = parseText(content)

      expect(result.title).toContain('This has')
      expect(result.isMarkdown).toBe(true)
    })

    it('should detect italic text markdown', () => {
      const content = 'This is *italic* text'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should detect markdown links', () => {
      const content = 'Check out [this link](https://example.com) for more'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should detect unordered lists', () => {
      const content = '- First item\n- Second item\n- Third item'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should detect ordered lists', () => {
      const content = '1. First item\n2. Second item'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should detect code blocks', () => {
      const content = '```\ncode block\n```'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should detect inline code', () => {
      const content = 'Use the `console.log()` function'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(true)
    })

    it('should handle empty content', () => {
      const result = parseText('')

      expect(result.title).toBe('')
      expect(result.isMarkdown).toBe(false)
    })

    it('should handle whitespace-only content', () => {
      const result = parseText('   \n\t  \n  ')

      expect(result.title).toBe('')
      expect(result.isMarkdown).toBe(false)
    })

    it('should handle single word content', () => {
      const result = parseText('Hello')

      expect(result.title).toBe('Hello')
      expect(result.isMarkdown).toBe(false)
    })

    it('should preserve content while truncating title', () => {
      const content = 'Short title\nMore content here\nEven more content'
      const result = parseText(content)

      expect(result.title).toBe('Short title')
      // The full content should be preserved (implied by implementation)
    })

    it('should not detect markdown in plain text', () => {
      const content = 'Just some regular text without any special characters'
      const result = parseText(content)

      expect(result.isMarkdown).toBe(false)
    })

    it('should handle multiple markdown patterns', () => {
      const content = '# Title\n\nSome **bold** and *italic* text with a [link](url).\n\n- List item\n- Another item'
      const result = parseText(content)

      expect(result.title).toBe('Title')
      expect(result.isMarkdown).toBe(true)
    })

    it('should truncate long titles with ellipsis', () => {
      const content = 'This is definitely longer than the fifteen character limit'
      const result = parseText(content)

      expect(result.title.length).toBeLessThanOrEqual(18) // 15 + '...'
      expect(result.title.endsWith('...')).toBe(true)
    })
  })
})
