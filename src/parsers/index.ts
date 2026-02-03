import type { MemoMetadata, MemoType } from '@/types'
import { parseURL } from './url-parser'
import { parseText } from './text-parser'

/** URL pattern for detection */
const URL_PATTERN = /^https?:\/\/[^\s]+$/

/** Parse input and determine type with metadata */
export async function parseInput(
  input: string
): Promise<{ type: MemoType; title: string; metadata?: MemoMetadata }> {
  const trimmed = input.trim()

  // Check if URL
  if (URL_PATTERN.test(trimmed)) {
    const metadata = await parseURL(trimmed)
    return {
      type: 'url',
      title: metadata.title || new URL(trimmed).hostname,
      metadata: {
        url: trimmed,
        favicon: metadata.favicon,
        ogDescription: metadata.ogDescription,
      },
    }
  }

  // Default to text
  const textResult = parseText(trimmed)
  return {
    type: 'text',
    title: textResult.title,
    metadata: textResult.isMarkdown ? { isMarkdown: true } : undefined,
  }
}

export { parseURL } from './url-parser'
export { parseText } from './text-parser'
