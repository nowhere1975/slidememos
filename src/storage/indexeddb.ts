import type { Memo } from '@/types'
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'slidememos'
const DB_VERSION = 1
const STORE_NAME = 'memos'

let dbPromise: Promise<IDBPDatabase> | null = null

/** Initialize IndexedDB connection */
function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
        store.createIndex('type', 'type')
      },
    })
  }
  return dbPromise
}

/** Get all memos from IndexedDB */
export async function getAllMemos(): Promise<Memo[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'updatedAt')
}

/** Save a memo to IndexedDB */
export async function saveMemo(memo: Memo): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, memo)
}

/** Delete a memo from IndexedDB */
export async function deleteMemo(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/** Search memos by keyword */
export async function searchMemos(keyword: string): Promise<Memo[]> {
  const memos = await getAllMemos()
  const lowerKeyword = keyword.toLowerCase()
  return memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(lowerKeyword) ||
      memo.content.toLowerCase().includes(lowerKeyword)
  )
}

/** Sync all memos to IndexedDB (rebuild cache) */
export async function syncToIndexedDB(memos: Memo[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.store.clear()
  await Promise.all(memos.map((memo) => tx.store.put(memo)))
  await tx.done
}

/** Check if IndexedDB is available */
export async function isIndexedDBAvailable(): Promise<boolean> {
  try {
    await getDB()
    return true
  } catch {
    return false
  }
}
