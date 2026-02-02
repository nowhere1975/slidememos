import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Memo, StorageSchema, StorageUsage } from '@/types'
import {
  getSyncUsage,
  getSyncData,
  saveSyncMemos,
  canFitInSync,
} from '../sync'

describe('storage/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSyncUsage', () => {
    it('should return current sync storage usage', async () => {
      vi.mocked(chrome.storage.sync.getBytesInUse).mockResolvedValue(5000)

      const usage: StorageUsage = await getSyncUsage()

      expect(usage.bytesInUse).toBe(5000)
      expect(usage.quota).toBe(102400) // STORAGE_CONSTANTS.SYNC_QUOTA
      expect(usage.percentage).toBe(5000 / 102400)
      expect(chrome.storage.sync.getBytesInUse).toHaveBeenCalledWith(null)
    })

    it('should handle empty storage', async () => {
      vi.mocked(chrome.storage.sync.getBytesInUse).mockResolvedValue(0)

      const usage = await getSyncUsage()

      expect(usage.bytesInUse).toBe(0)
      expect(usage.percentage).toBe(0)
    })
  })

  describe('getSyncData', () => {
    it('should return memos and settings from sync storage', async () => {
      const mockMemos: Memo[] = [
        {
          id: 'memo1',
          content: 'Test content',
          title: 'Test',
          type: 'text',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      const mockSettings = { theme: 'dark' as const }

      vi.mocked(chrome.storage.sync.get).mockResolvedValue({
        memos: mockMemos,
        settings: mockSettings,
      })

      const data: StorageSchema = await getSyncData()

      expect(data.memos).toEqual(mockMemos)
      expect(data.settings).toEqual(mockSettings)
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['memos', 'settings'])
    })

    it('should return default values when storage is empty', async () => {
      vi.mocked(chrome.storage.sync.get).mockResolvedValue({})

      const data = await getSyncData()

      expect(data.memos).toEqual([])
      expect(data.settings).toEqual({
        quickSaveShortcut: 'Alt+S',
        theme: 'auto',
      })
    })
  })

  describe('saveSyncMemos', () => {
    it('should save memos to sync storage', async () => {
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

      await saveSyncMemos(memos)

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ memos })
    })

    it('should throw error when quota exceeded', async () => {
      const largeMemo: Memo = {
        id: '1',
        content: 'x'.repeat(10000),
        title: 'Large',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      vi.mocked(chrome.storage.sync.set).mockRejectedValue(
        new Error('QUOTA_BYTES_PER_ITEM quota exceeded')
      )

      await expect(saveSyncMemos([largeMemo])).rejects.toThrow('QUOTA_BYTES')
    })
  })

  describe('canFitInSync', () => {
    it('should return true for small memo with low usage', async () => {
      vi.mocked(chrome.storage.sync.getBytesInUse).mockResolvedValue(1000)

      const memo: Memo = {
        id: '1',
        content: 'Small content',
        title: 'Small',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const result = await canFitInSync(memo)

      expect(result).toBe(true)
    })

    it('should return false for memo exceeding MAX_MEMO_SIZE', async () => {
      const largeMemo: Memo = {
        id: '1',
        content: 'x'.repeat(9000),
        title: 'Large',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const result = await canFitInSync(largeMemo)

      expect(result).toBe(false)
    })

    it('should return false when storage usage exceeds threshold', async () => {
      // Set usage to 80% (above 75% threshold)
      vi.mocked(chrome.storage.sync.getBytesInUse).mockResolvedValue(81920)

      const memo: Memo = {
        id: '1',
        content: 'Content',
        title: 'Title',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const result = await canFitInSync(memo)

      expect(result).toBe(false)
    })
  })
})
