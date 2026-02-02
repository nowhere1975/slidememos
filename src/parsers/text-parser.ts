export interface TextParseResult {
  title: string
  isMarkdown: boolean
}

/** Maximum title length */
const MAX_TITLE_LENGTH = 15

/** Parse text content and generate title */
export function parseText(content: string): TextParseResult {
  const lines = content.split('\n').filter((line) => line.trim())
  const firstLine = lines[0] || ''

  // Check if markdown heading
  const headingMatch = firstLine.match(/^#+\s+(.+)$/)
  if (headingMatch) {
    return {
      title: truncate(headingMatch[1], MAX_TITLE_LENGTH),
      isMarkdown: true,
    }
  }

  // Check for markdown patterns
  const isMarkdown = hasMarkdownPatterns(content)

  return {
    title: truncate(firstLine, MAX_TITLE_LENGTH),
    isMarkdown,
  }
}

/** Check if content contains markdown patterns */
function hasMarkdownPatterns(content: string): boolean {
  const patterns = [
    /^#+\s/m, // Headings
    /\*\*[^*]+\*\*/, // Bold
    /\*[^*]+\*/, // Italic
    /\[[^\]]+\]\([^)]+\)/, // Links
    /^[-*]\s/m, // Unordered lists
    /^\d+\.\s/m, // Ordered lists
    /^```/m, // Code blocks
    /`[^`]+`/, // Inline code
  ]

  return patterns.some((pattern) => pattern.test(content))
}

/** Truncate string to max length with ellipsis */
function truncate(str: string, maxLength: number): string {
  const trimmed = str.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return trimmed.slice(0, maxLength) + '...'
}
