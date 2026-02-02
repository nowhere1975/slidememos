import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDraft,
  saveDraft,
  clearDraft,
  hasDraft,
  getCollapsedIds,
  saveCollapsedIds,
} from '../session'

describe('storage/session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock implementations
    vi.mocked(chrome.storage.session.get).mockResolvedValue({})
    vi.mocked(chrome.storage.session.set).mockResolvedValue(undefined)
    vi.mocked(chrome.storage.session.remove).mockResolvedValue(undefined)
  })

  describe('getDraft', () => {
    it('should return draft content from session storage', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({
        draft_content: 'My draft content',
      })

      const draft = await getDraft()

      expect(draft).toBe('My draft content')
      expect(chrome.storage.session.get).toHaveBeenCalledWith('draft_content')
    })

    it('should return empty string when no draft exists', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({})

      const draft = await getDraft()

      expect(draft).toBe('')
    })

    it('should handle storage errors', async () => {
      vi.mocked(chrome.storage.session.get).mockRejectedValue(new Error('Storage error'))

      await expect(getDraft()).rejects.toThrow('Storage error')
    })
  })

  describe('saveDraft', () => {
    it('should save draft content to session storage', async () => {
      await saveDraft('New draft content')

      expect(chrome.storage.session.set).toHaveBeenCalledWith({
        draft_content: 'New draft content',
      })
    })

    it('should save empty string', async () => {
      await saveDraft('')

      expect(chrome.storage.session.set).toHaveBeenCalledWith({
        draft_content: '',
      })
    })

    it('should save multiline content', async () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3'
      await saveDraft(multilineContent)

      expect(chrome.storage.session.set).toHaveBeenCalledWith({
        draft_content: multilineContent,
      })
    })

    it('should handle storage errors', async () => {
      // Reset the mock to return a resolved value first
      vi.mocked(chrome.storage.session.set).mockResolvedValue(undefined)
      // Then set up the rejection for this specific call
      vi.mocked(chrome.storage.session.set).mockRejectedValueOnce(new Error('Quota exceeded'))

      await expect(saveDraft('content')).rejects.toThrow('Quota exceeded')
    })
  })

  describe('clearDraft', () => {
    it('should remove draft from session storage', async () => {
      await clearDraft()

      expect(chrome.storage.session.remove).toHaveBeenCalledWith('draft_content')
    })

    it('should handle storage errors', async () => {
      vi.mocked(chrome.storage.session.remove).mockRejectedValue(new Error('Storage error'))

      await expect(clearDraft()).rejects.toThrow('Storage error')
    })
  })

  describe('hasDraft', () => {
    it('should return true when draft has content', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({
        draft_content: 'Some draft content',
      })

      const result = await hasDraft()

      expect(result).toBe(true)
    })

    it('should return false when draft is empty string', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({
        draft_content: '',
      })

      const result = await hasDraft()

      expect(result).toBe(false)
    })

    it('should return false when draft is whitespace only', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({
        draft_content: '   \n\t  ',
      })

      const result = await hasDraft()

      expect(result).toBe(false)
    })

    it('should return false when no draft exists', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({})

      const result = await hasDraft()

      expect(result).toBe(false)
    })
  })

  describe('getCollapsedIds', () => {
    it('should return collapsed memo IDs', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({
        collapsed_memos: ['memo-1', 'memo-2', 'memo-3'],
      })

      const ids = await getCollapsedIds()

      expect(ids).toEqual(['memo-1', 'memo-2', 'memo-3'])
      expect(chrome.storage.session.get).toHaveBeenCalledWith('collapsed_memos')
    })

    it('should return empty array when no collapsed memos', async () => {
      vi.mocked(chrome.storage.session.get).mockResolvedValue({})

      const ids = await getCollapsedIds()

      expect(ids).toEqual([])
    })
  })

  describe('saveCollapsedIds', () => {
    it('should save collapsed memo IDs', async () => {
      const ids = ['memo-a', 'memo-b']
      await saveCollapsedIds(ids)

      expect(chrome.storage.session.set).toHaveBeenCalledWith({
        collapsed_memos: ids,
      })
    })

    it('should save empty array', async () => {
      await saveCollapsedIds([])

      expect(chrome.storage.session.set).toHaveBeenCalledWith({
        collapsed_memos: [],
      })
    })
  })
})
