/** Memo type classification */
export type MemoType = 'text' | 'url'

/** Memo metadata for URL and code types */
export interface MemoMetadata {
  url?: string
  favicon?: string
  ogDescription?: string
  language?: string
  isMarkdown?: boolean
}

/** Core Memo data structure */
export interface Memo {
  id: string
  content: string
  title: string
  type: MemoType
  metadata?: MemoMetadata
  createdAt: number
  updatedAt: number
  _local_only?: boolean
  hidden?: boolean
}

/** Create a new Memo with defaults */
export function createMemo(partial: Partial<Memo> & { content: string }): Memo {
  const now = Date.now()
  return {
    id: '',
    title: '',
    type: 'text',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}
