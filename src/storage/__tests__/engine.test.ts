import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Memo } from '@/types'
import {
  getAllMemos,
  saveMemo,
  updateMemo,
  deleteMemo,
  findMemoByUrl,
  importMemos,
  validateMemoData,
  initStorage,
} from '../engine'

// Mock dependencies
vi.mock('../sync')
vi.mock('../local')
vi.mock('../indexeddb')
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-id-123'),
}))

import { getSyncData, saveSyncMemos } from '../sync'
import { getLocalMemos, addLocalMemo, deleteLocalMemo, saveLocalMemos } from '../local'
import { saveMemo as saveToIDB, deleteMemo as deleteFromIDB, syncToIndexedDB } from '../indexeddb'

describe('storage/engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllMemos', () => {
    it('should merge sync and local memos', async () => {
      const syncMemos: Memo[] = [
        { id: 'sync1', content: 'Sync', title: 'Sync', type: 'text', createdAt: 1000, updatedAt: 3000 },
      ]
      const localMemos: Memo[] = [
        { id: 'local1', content: 'Local', title: 'Local', type: 'text', createdAt: 2000, updatedAt: 2000, _local_only: true },
      ]

      vi.mocked(getSyncData).mockResolvedValue({ memos: syncMemos, settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' } })
      vi.mocked(getLocalMemos).mockResolvedValue(localMemos)

      const result = await getAllMemos()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('sync1') // Sorted by updatedAt desc
      expect(result[1].id).toBe('local1')
    })

    it('should sort by updatedAt descending', async () => {
      const memos: Memo[] = [
        { id: '1', content: 'A', title: 'A', type: 'text', createdAt: 1000, updatedAt: 1000 },
        { id: '2', content: 'B', title: 'B', type: 'text', createdAt: 1000, updatedAt: 3000 },
        { id: '3', content: 'C', title: 'C', type: 'text', createdAt: 1000, updatedAt: 2000 },
      ]

      vi.mocked(getSyncData).mockResolvedValue({ memos, settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' } })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await getAllMemos()

      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('3')
      expect(result[2].id).toBe('1')
    })

    it('should return empty array when no memos', async () => {
      vi.mocked(getSyncData).mockResolvedValue({ memos: [], settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' } })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await getAllMemos()

      expect(result).toEqual([])
    })
  })

  describe('saveMemo', () => {
    it('should save to sync storage when under quota', async () => {
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      const memoData = {
        content: 'Test content',
        title: 'Test',
        type: 'text' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const result = await saveMemo(memoData)

      expect(result.id).toBe('mock-id-123')
      expect(saveSyncMemos).toHaveBeenCalled()
      expect(addLocalMemo).not.toHaveBeenCalled()
      expect(saveToIDB).toHaveBeenCalled()
      expect(result._local_only).toBeUndefined()
    })

    it('should fallback to local storage when sync quota exceeded', async () => {
      // Create a large existing memo to push us over quota
      const largeMemo: Memo = {
        id: 'large',
        content: 'x'.repeat(8000),
        title: 'Large',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [largeMemo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      const memoData = {
        content: 'Small content',
        title: 'Small',
        type: 'text' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const result = await saveMemo(memoData)

      expect(addLocalMemo).toHaveBeenCalled()
      expect(saveSyncMemos).not.toHaveBeenCalled()
      expect(result._local_only).toBe(true)
    })

    it('should save to IndexedDB for search', async () => {
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      const memoData = {
        content: 'Test',
        title: 'Test',
        type: 'text' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await saveMemo(memoData)

      expect(saveToIDB).toHaveBeenCalled()
    })
  })

  describe('updateMemo', () => {
    it('should update existing memo in sync storage', async () => {
      const existingMemo: Memo = {
        id: 'existing',
        content: 'Old',
        title: 'Old',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [existingMemo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      const updated = await updateMemo(existingMemo)

      expect(saveSyncMemos).toHaveBeenCalled()
      expect(updated.updatedAt).toBeGreaterThan(existingMemo.updatedAt)
    })

    it('should migrate to local if size exceeds quota on update', async () => {
      const existingMemo: Memo = {
        id: 'existing',
        content: 'Old',
        title: 'Old',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      // Create large memo that will exceed quota when combined
      const largeMemo: Memo = {
        id: 'large',
        content: 'x'.repeat(8000), // 8KB
        title: 'Large',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [largeMemo, existingMemo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      const updated = await updateMemo(existingMemo)

      expect(addLocalMemo).toHaveBeenCalled()
      expect(updated._local_only).toBe(true)
    })

    it('should handle local_only memo update', async () => {
      const localMemo: Memo = {
        id: 'local',
        content: 'Local',
        title: 'Local',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
        _local_only: true,
      }

      const updated = await updateMemo(localMemo)

      expect(addLocalMemo).toHaveBeenCalled()
      expect(updated._local_only).toBe(true)
    })
  })

  describe('deleteMemo', () => {
    it('should delete from local storage if _local_only', async () => {
      const memo: Memo = {
        id: 'local',
        content: 'Local',
        title: 'Local',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        _local_only: true,
      }

      await deleteMemo(memo)

      expect(deleteLocalMemo).toHaveBeenCalledWith('local')
      expect(saveSyncMemos).not.toHaveBeenCalled()
      expect(deleteFromIDB).toHaveBeenCalledWith('local')
    })

    it('should delete from sync storage if not _local_only', async () => {
      const memo: Memo = {
        id: 'sync',
        content: 'Sync',
        title: 'Sync',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [memo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })

      await deleteMemo(memo)

      expect(saveSyncMemos).toHaveBeenCalled()
      expect(deleteLocalMemo).not.toHaveBeenCalled()
      expect(deleteFromIDB).toHaveBeenCalledWith('sync')
    })
  })

  describe('findMemoByUrl', () => {
    it('should find memo by URL', async () => {
      const urlMemo: Memo = {
        id: 'url1',
        content: 'URL content',
        title: 'URL Memo',
        type: 'url',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: { url: 'https://example.com/page' },
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [urlMemo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await findMemoByUrl('https://example.com/page')

      expect(result).toBeDefined()
      expect(result?.id).toBe('url1')
    })

    it('should return undefined if URL not found', async () => {
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await findMemoByUrl('https://example.com/not-found')

      expect(result).toBeUndefined()
    })

    it('should not match non-URL memos', async () => {
      const textMemo: Memo = {
        id: 'text1',
        content: 'Text content',
        title: 'Text Memo',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [textMemo],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await findMemoByUrl('https://example.com')

      expect(result).toBeUndefined()
    })
  })

  describe('importMemos', () => {
    it('should import new memos with skip strategy', async () => {
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const imported: Memo[] = [
        { id: 'new1', content: 'New 1', title: 'New 1', type: 'text', createdAt: 1000, updatedAt: 1000 },
        { id: 'new2', content: 'New 2', title: 'New 2', type: 'text', createdAt: 1000, updatedAt: 1000 },
      ]

      const result = await importMemos(imported, 'skip')

      expect(result.imported).toBe(2)
      expect(result.skipped).toBe(0)
      expect(result.errors).toBe(0)
    })

    it('should skip existing memos with skip strategy', async () => {
      const existing: Memo = {
        id: 'existing',
        content: 'Existing',
        title: 'Existing',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [existing],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const imported: Memo[] = [existing]

      const result = await importMemos(imported, 'skip')

      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
    })

    it('should overwrite existing memos with overwrite strategy', async () => {
      const existing: Memo = {
        id: 'existing',
        content: 'Old',
        title: 'Old',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [existing],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const updated: Memo = { ...existing, content: 'Updated' }

      const result = await importMemos([updated], 'overwrite')

      expect(result.imported).toBe(1)
    })

    it('should duplicate with new ID using duplicate strategy', async () => {
      const existing: Memo = {
        id: 'existing',
        content: 'Existing',
        title: 'Existing',
        type: 'text',
        createdAt: 1000,
        updatedAt: 1000,
      }
      vi.mocked(getSyncData).mockResolvedValue({
        memos: [existing],
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await importMemos([existing], 'duplicate')

      expect(result.imported).toBe(1)
    })
  })

  describe('validateMemoData', () => {
    it('should validate correct memo array', () => {
      const data = [
        { id: '1', content: 'Test', title: 'Test', type: 'text', createdAt: 1000, updatedAt: 1000 },
      ]

      expect(validateMemoData(data)).toBe(true)
    })

    it('should reject non-array data', () => {
      expect(validateMemoData({})).toBe(false)
      expect(validateMemoData(null)).toBe(false)
      expect(validateMemoData('string')).toBe(false)
    })

    it('should reject invalid memo objects', () => {
      const data = [
        { id: 1, content: 'Test', title: 'Test', type: 'text', createdAt: 1000, updatedAt: 1000 }, // id should be string
      ]

      expect(validateMemoData(data)).toBe(false)
    })

    it('should reject invalid type', () => {
      const data = [
        { id: '1', content: 'Test', title: 'Test', type: 'invalid', createdAt: 1000, updatedAt: 1000 },
      ]

      expect(validateMemoData(data)).toBe(false)
    })
  })

  describe('initStorage', () => {
    it('should initialize storage and sync IndexedDB', async () => {
      const memos: Memo[] = [
        { id: '1', content: 'Test', title: 'Test', type: 'text', createdAt: 1000, updatedAt: 1000 },
      ]
      vi.mocked(getSyncData).mockResolvedValue({
        memos,
        settings: { theme: 'auto', quickSaveShortcut: 'Alt+S' }
      })
      vi.mocked(getLocalMemos).mockResolvedValue([])

      const result = await initStorage()

      expect(result).toHaveLength(1)
      expect(syncToIndexedDB).toHaveBeenCalled()
    })
  })
})
