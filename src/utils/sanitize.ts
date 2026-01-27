import DOMPurify from 'dompurify'
import { marked } from 'marked'

/** Sanitize HTML content to prevent XSS */
export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

/** Sanitize and add security attributes to links */
export function sanitizeWithLinks(dirty: string): string {
  const clean = sanitize(dirty)
  // Add rel="noopener noreferrer" to all links
  return clean.replace(/<a /g, '<a rel="noopener noreferrer" target="_blank" ')
}

/** Render Markdown to sanitized HTML */
export function renderMarkdown(content: string): string {
  const html = marked.parse(content, { async: false }) as string
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote',
      'pre', 'code',
      'a', 'strong', 'em', 'del', 's',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  }).replace(/<a /g, '<a rel="noopener noreferrer" target="_blank" ')
}
