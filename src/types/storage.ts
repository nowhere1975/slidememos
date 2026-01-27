import type { Memo } from './memo'

/** User settings */
export interface UserSettings {
  quickSaveShortcut: string
  theme: 'auto' | 'light' | 'dark'
}

/** Storage schema for L2/L3 */
export interface StorageSchema {
  memos: Memo[]
  settings: UserSettings
}

/** Draft storage for L1 */
export interface DraftSchema {
  draft?: Memo
}

/** Storage usage info */
export interface StorageUsage {
  bytesInUse: number
  quota: number
  percentage: number
}

/** Default settings */
export const DEFAULT_SETTINGS: UserSettings = {
  quickSaveShortcut: 'Alt+S',
  theme: 'auto',
}

/** Storage constants */
export const STORAGE_CONSTANTS = {
  SYNC_QUOTA: 102400, // 100KB
  SYNC_THRESHOLD: 0.75, // 75%
  MAX_MEMO_SIZE: 8192, // 8KB per memo
  LOCAL_QUOTA: 5242880, // 5MB
} as const
