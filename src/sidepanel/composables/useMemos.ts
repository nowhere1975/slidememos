import { ref, computed } from 'vue'
import type { Memo } from '@/types'
import { initStorage, getAllMemos } from '@/storage/engine'
import { measureTimeAsync } from '@/utils'

const memos = ref<Memo[]>([])
const isLoading = ref(true)
const newMemoId = ref<string>()

export function useMemos() {
  async function loadMemos() {
    isLoading.value = true
    try {
      memos.value = await measureTimeAsync(() => initStorage(), 'Cold start')
    } finally {
      isLoading.value = false
    }
  }

  async function reloadMemos() {
    memos.value = await measureTimeAsync(() => getAllMemos(), 'Reload memos')
  }

  function addMemo(memo: Memo) {
    memos.value = [memo, ...memos.value]
    highlightMemo(memo.id)
  }

  function updateMemo(memo: Memo) {
    memos.value = [memo, ...memos.value.filter((m) => m.id !== memo.id)]
    highlightMemo(memo.id)
  }

  function removeMemo(id: string) {
    memos.value = memos.value.filter((m) => m.id !== id)
  }

  function highlightMemo(id: string) {
    newMemoId.value = id
    setTimeout(() => {
      newMemoId.value = undefined
    }, 1500)
  }

  return {
    memos: computed(() => memos.value),
    isLoading: computed(() => isLoading.value),
    newMemoId: computed(() => newMemoId.value),
    loadMemos,
    reloadMemos,
    addMemo,
    updateMemo,
    removeMemo,
  }
}
