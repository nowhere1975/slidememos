import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Memo } from '@/types'
import {
  getLocalMemos,
  saveLocalMemos,
  addLocalMemo,
  deleteLocalMemo,
} from '../local'

describe('storage/local', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLocalMemos', () => {
    it('should return memos from local storage', async () => {
      const mockMemos: Memo[] = [
        {
          id: 'local1',
          content: 'Local memo content',
          title: 'Local Memo',
          type: 'text',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _local_only: true,
        },
      ]
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: mockMemos,
      })

      const memos = await getLocalMemos()

      expect(memos).toEqual(mockMemos)
      expect(chrome.storage.local.get).toHaveBeenCalledWith('local_memos')
    })

    it('should return empty array when no memos stored', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})

      const memos = await getLocalMemos()

      expect(memos).toEqual([])
    })

    it('should handle storage errors gracefully', async () => {
      vi.mocked(chrome.storage.local.get).mockRejectedValue(new Error('Storage error'))

      // Should throw or handle error based on implementation
      await expect(getLocalMemos()).rejects.toThrow('Storage error')
    })
  })

  describe('saveLocalMemos', () => {
    it('should save memos to local storage', async () => {
      const memos: Memo[] = [
        {
          id: '1',
          content: 'Test',
          title: 'Test',
          type: 'text',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      await saveLocalMemos(memos)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: memos,
      })
    })

    it('should overwrite existing memos', async () => {
      const newMemos: Memo[] = []

      await saveLocalMemos(newMemos)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [],
      })
    })

    it('should handle large memo arrays', async () => {
      const largeMemos: Memo[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `memo-${i}`,
        content: `Content ${i}`,
        title: `Title ${i}`,
        type: 'text' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }))

      await saveLocalMemos(largeMemos)

      expect(chrome.storage.local.set).toHaveBeenCalled()
    })
  })

  describe('addLocalMemo', () => {
    it('should add new memo to local storage', async () => {
      const existingMemo: Memo = {
        id: 'existing',
        content: 'Existing',
        title: 'Existing',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: [existingMemo],
      })

      const newMemo: Memo = {
        id: 'new',
        content: 'New',
        title: 'New',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await addLocalMemo(newMemo)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [existingMemo, newMemo],
      })
    })

    it('should update existing memo with same ID', async () => {
      const originalMemo: Memo = {
        id: 'same-id',
        content: 'Original',
        title: 'Original',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: [originalMemo],
      })

      const updatedMemo: Memo = {
        ...originalMemo,
        content: 'Updated',
        title: 'Updated',
        updatedAt: Date.now() + 1000,
      }

      await addLocalMemo(updatedMemo)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [updatedMemo],
      })
    })

    it('should handle empty storage', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})

      const newMemo: Memo = {
        id: 'first',
        content: 'First',
        title: 'First',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await addLocalMemo(newMemo)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [newMemo],
      })
    })
  })

  describe('deleteLocalMemo', () => {
    it('should delete memo by ID', async () => {
      const memos: Memo[] = [
        { id: '1', content: 'One', title: 'One', type: 'text', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '2', content: 'Two', title: 'Two', type: 'text', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '3', content: 'Three', title: 'Three', type: 'text', createdAt: Date.now(), updatedAt: Date.now() },
      ]
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: memos,
      })

      await deleteLocalMemo('2')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [memos[0], memos[2]],
      })
    })

    it('should handle non-existent ID', async () => {
      const memos: Memo[] = [
        { id: '1', content: 'One', title: 'One', type: 'text', createdAt: Date.now(), updatedAt: Date.now() },
      ]
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: memos,
      })

      await deleteLocalMemo('non-existent')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: memos,
      })
    })

    it('should handle empty storage', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})

      await deleteLocalMemo('1')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [],
      })
    })

    it('should handle last memo deletion', async () => {
      const memos: Memo[] = [
        { id: '1', content: 'Only', title: 'Only', type: 'text', createdAt: Date.now(), updatedAt: Date.now() },
      ]
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        local_memos: memos,
      })

      await deleteLocalMemo('1')

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        local_memos: [],
      })
    })
  })
})
