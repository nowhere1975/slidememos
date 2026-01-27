import type { Memo } from '@/types'

const LOCAL_MEMOS_KEY = 'local_memos'

/** Get memos from local storage (overflow storage) */
export async function getLocalMemos(): Promise<Memo[]> {
  const data = await chrome.storage.local.get(LOCAL_MEMOS_KEY)
  return data[LOCAL_MEMOS_KEY] || []
}

/** Save memos to local storage */
export async function saveLocalMemos(memos: Memo[]): Promise<void> {
  await chrome.storage.local.set({ [LOCAL_MEMOS_KEY]: memos })
}

/** Add a memo to local storage */
export async function addLocalMemo(memo: Memo): Promise<void> {
  const memos = await getLocalMemos()
  const index = memos.findIndex((m) => m.id === memo.id)
  if (index >= 0) {
    memos[index] = memo
  } else {
    memos.push(memo)
  }
  await saveLocalMemos(memos)
}

/** Delete a memo from local storage */
export async function deleteLocalMemo(id: string): Promise<void> {
  const memos = await getLocalMemos()
  const filtered = memos.filter((m) => m.id !== id)
  await saveLocalMemos(filtered)
}
