const DRAFT_KEY = 'draft_content'
const COLLAPSED_KEY = 'collapsed_memos'

/** Get current draft content from session storage */
export async function getDraft(): Promise<string> {
  const data = await chrome.storage.session.get(DRAFT_KEY)
  return data[DRAFT_KEY] || ''
}

/** Save draft content to session storage */
export async function saveDraft(content: string): Promise<void> {
  await chrome.storage.session.set({ [DRAFT_KEY]: content })
}

/** Clear draft from session storage */
export async function clearDraft(): Promise<void> {
  await chrome.storage.session.remove(DRAFT_KEY)
}

/** Check if there is an unsaved draft */
export async function hasDraft(): Promise<boolean> {
  const draft = await getDraft()
  return draft.trim().length > 0
}

/** Get collapsed memo IDs from session storage */
export async function getCollapsedIds(): Promise<string[]> {
  const data = await chrome.storage.session.get(COLLAPSED_KEY)
  return data[COLLAPSED_KEY] || []
}

/** Save collapsed memo IDs to session storage */
export async function saveCollapsedIds(ids: string[]): Promise<void> {
  await chrome.storage.session.set({ [COLLAPSED_KEY]: ids })
}
