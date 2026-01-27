import type { Memo } from '@/types'
import { nanoid } from 'nanoid'
import { getSyncData, saveSyncMemos } from './sync'
import { getLocalMemos, addLocalMemo, deleteLocalMemo, saveLocalMemos } from './local'
import { syncToIndexedDB, saveMemo as saveToIDB, deleteMemo as deleteFromIDB } from './indexeddb'

/** Get all memos from both sync and local storage */
export async function getAllMemos(): Promise<Memo[]> {
  const [syncData, localMemos] = await Promise.all([getSyncData(), getLocalMemos()])
  const allMemos = [...syncData.memos, ...localMemos]
  // Sort by updatedAt descending
  return allMemos.sort((a, b) => b.updatedAt - a.updatedAt)
}

/** Save a new memo with automatic storage tier selection */
export async function saveMemo(memo: Omit<Memo, 'id'>): Promise<Memo> {
  const newMemo: Memo = {
    ...memo,
    id: nanoid(12),
  }

  // Get current sync data to check total size
  const syncData = await getSyncData()
  const newMemos = [...syncData.memos, newMemo]
  const totalSize = new Blob([JSON.stringify({ memos: newMemos })]).size

  // Check if total size fits in sync storage per-item limit (8KB)
  const canSync = totalSize < 7500 && !newMemo._local_only

  let savedToSync = false
  if (canSync) {
    try {
      // Try to save to sync storage
      await saveSyncMemos(newMemos)
      savedToSync = true
    } catch {
      // Sync storage failed, will fall back to local
      savedToSync = false
    }
  }

  if (!savedToSync) {
    // Save to local storage with flag
    newMemo._local_only = true
    await addLocalMemo(newMemo)
  }

  // Also save to IndexedDB for search
  await saveToIDB(newMemo)

  return newMemo
}

/** Update an existing memo */
export async function updateMemo(memo: Memo): Promise<Memo> {
  // Create a clean copy to avoid Vue reactive proxy issues with IndexedDB
  const updated: Memo = {
    id: memo.id,
    content: memo.content,
    title: memo.title,
    type: memo.type,
    metadata: memo.metadata ? { ...memo.metadata } : undefined,
    createdAt: memo.createdAt,
    updatedAt: Date.now(),
    _local_only: memo._local_only,
    hidden: memo.hidden,
  }

  if (memo._local_only) {
    await addLocalMemo(updated)
  } else {
    const syncData = await getSyncData()
    const index = syncData.memos.findIndex((m) => m.id === memo.id)
    if (index >= 0) {
      syncData.memos[index] = updated
      // Check if sync storage can fit the updated data
      const dataSize = new Blob([JSON.stringify({ memos: syncData.memos })]).size
      if (dataSize > 8000) {
        // Exceeds quota, move to local storage
        syncData.memos.splice(index, 1)
        await saveSyncMemos(syncData.memos)
        updated._local_only = true
        await addLocalMemo(updated)
      } else {
        await saveSyncMemos(syncData.memos)
      }
    } else {
      // Memo not found in sync, save to local storage
      updated._local_only = true
      await addLocalMemo(updated)
    }
  }

  await saveToIDB(updated)
  return updated
}

/** Delete a memo */
export async function deleteMemo(memo: Memo): Promise<void> {
  if (memo._local_only) {
    await deleteLocalMemo(memo.id)
  } else {
    const syncData = await getSyncData()
    syncData.memos = syncData.memos.filter((m) => m.id !== memo.id)
    await saveSyncMemos(syncData.memos)
  }

  await deleteFromIDB(memo.id)
}

/** Migrate sync storage data to local storage if it exceeds quota */
async function migrateIfNeeded(): Promise<void> {
  try {
    const syncData = await getSyncData()
    if (syncData.memos.length === 0) return

    const dataSize = new Blob([JSON.stringify({ memos: syncData.memos })]).size
    if (dataSize > 7000) {
      // Sync storage is too large, migrate all memos to local storage
      console.log('Migrating sync storage to local storage due to quota...')
      const localMemos = await getLocalMemos()
      const migratedMemos = syncData.memos.map((m) => ({ ...m, _local_only: true }))

      // Merge with existing local memos
      const mergedMemos = [...localMemos]
      for (const memo of migratedMemos) {
        const idx = mergedMemos.findIndex((m) => m.id === memo.id)
        if (idx >= 0) {
          mergedMemos[idx] = memo
        } else {
          mergedMemos.push(memo)
        }
      }

      // Save to local storage
      await saveLocalMemos(mergedMemos)

      // Clear sync storage memos
      await saveSyncMemos([])
      console.log('Migration complete')
    }
  } catch (error) {
    console.error('Migration check failed:', error)
  }
}

/** Initialize storage and sync IndexedDB cache */
export async function initStorage(): Promise<Memo[]> {
  // First, migrate if sync storage is too large
  await migrateIfNeeded()

  const memos = await getAllMemos()
  await syncToIndexedDB(memos)
  return memos
}

/** Check if a URL already exists in storage */
export async function findMemoByUrl(url: string): Promise<Memo | undefined> {
  const memos = await getAllMemos()
  return memos.find((m) => m.type === 'url' && m.metadata?.url === url)
}

/** Import memos from JSON data with conflict handling (batch mode) */
export async function importMemos(
  importedMemos: Memo[],
  strategy: 'skip' | 'overwrite' | 'duplicate' = 'skip'
): Promise<{ imported: number; skipped: number; errors: number }> {
  const existingMemos = await getAllMemos()
  const existingIds = new Set(existingMemos.map((m) => m.id))

  let imported = 0
  let skipped = 0
  let errors = 0

  // Collect memos to import
  const memosToImport: Memo[] = []

  for (const memo of importedMemos) {
    try {
      const exists = existingIds.has(memo.id)

      if (exists) {
        if (strategy === 'skip') {
          skipped++
          continue
        } else if (strategy === 'overwrite') {
          memosToImport.push(memo)
          imported++
        } else if (strategy === 'duplicate') {
          memosToImport.push({ ...memo, id: nanoid(12) })
          imported++
        }
      } else {
        memosToImport.push(memo)
        imported++
      }
    } catch {
      errors++
    }
  }

  // Batch write to local storage (bypass sync quota issues for bulk import)
  if (memosToImport.length > 0) {
    try {
      // Mark all as local_only for bulk import
      const localMemos = memosToImport.map((m) => ({ ...m, _local_only: true }))

      // Get existing local memos and merge
      const existingLocal = await getLocalMemos()

      // Update existing or add new
      const mergedMemos = [...existingLocal]
      for (const memo of localMemos) {
        const idx = mergedMemos.findIndex((m) => m.id === memo.id)
        if (idx >= 0) {
          mergedMemos[idx] = memo
        } else {
          mergedMemos.push(memo)
        }
      }

      // Single write to local storage
      await saveLocalMemos(mergedMemos)

      // Batch sync to IndexedDB
      await syncToIndexedDB(await getAllMemos())
    } catch {
      // If batch write fails, count all as errors
      errors += imported
      imported = 0
    }
  }

  return { imported, skipped, errors }
}

/** Validate imported memo data */
export function validateMemoData(data: unknown): data is Memo[] {
  if (!Array.isArray(data)) return false
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.content === 'string' &&
      typeof item.title === 'string' &&
      ['text', 'url', 'code'].includes(item.type) &&
      typeof item.createdAt === 'number' &&
      typeof item.updatedAt === 'number'
  )
}

export { getSyncData } from './sync'
export { getDraft, saveDraft, clearDraft, hasDraft, getCollapsedIds, saveCollapsedIds } from './session'
export { searchMemos, isIndexedDBAvailable } from './indexeddb'
