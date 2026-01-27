import type { Memo, StorageSchema, StorageUsage } from '@/types'
import { STORAGE_CONSTANTS, DEFAULT_SETTINGS } from '@/types'

/** Get current sync storage usage */
export async function getSyncUsage(): Promise<StorageUsage> {
  const bytesInUse = await chrome.storage.sync.getBytesInUse(null)
  return {
    bytesInUse,
    quota: STORAGE_CONSTANTS.SYNC_QUOTA,
    percentage: bytesInUse / STORAGE_CONSTANTS.SYNC_QUOTA,
  }
}

/** Get all data from sync storage */
export async function getSyncData(): Promise<StorageSchema> {
  const data = await chrome.storage.sync.get(['memos', 'settings'])
  return {
    memos: data.memos || [],
    settings: data.settings || DEFAULT_SETTINGS,
  }
}

/** Save memos to sync storage */
export async function saveSyncMemos(memos: Memo[]): Promise<void> {
  await chrome.storage.sync.set({ memos })
}

/** Check if a memo can fit in sync storage */
export async function canFitInSync(memo: Memo): Promise<boolean> {
  const memoSize = new Blob([JSON.stringify(memo)]).size
  if (memoSize > STORAGE_CONSTANTS.MAX_MEMO_SIZE) {
    return false
  }
  const usage = await getSyncUsage()
  return usage.percentage < STORAGE_CONSTANTS.SYNC_THRESHOLD
}
