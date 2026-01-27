import type { MemoMetadata, MemoType } from '@/types'
import { parseURL } from './url-parser'
import { parseText } from './text-parser'
import { detectCodeLanguage } from './code-parser'

/** URL pattern for detection */
const URL_PATTERN = /^https?:\/\/[^\s]+$/

/** Code block pattern */
const CODE_PATTERN = /^```(\w+)?\n[\s\S]+\n```$/

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

  // Check if code block
  if (CODE_PATTERN.test(trimmed)) {
    const language = detectCodeLanguage(trimmed)
    return {
      type: 'code',
      title: `Code: ${language}`,
      metadata: { language },
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
export { detectCodeLanguage } from './code-parser'
