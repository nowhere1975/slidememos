import { ref, watch, onMounted } from 'vue'
import { getDraft, saveDraft, clearDraft } from '@/storage/engine'
import { debounce } from '@/utils'

export function useDraft() {
  const content = ref('')
  const isRestored = ref(false)

  // Debounced save to session storage
  const debouncedSave = debounce((value: string) => {
    saveDraft(value)
  }, 500)

  // Watch content changes and auto-save
  watch(content, (newValue) => {
    if (isRestored.value) {
      debouncedSave(newValue)
    }
  })

  // Restore draft on mount
  onMounted(async () => {
    const draft = await getDraft()
    if (draft) {
      content.value = draft
    }
    isRestored.value = true
  })

  // Clear draft after successful save
  function clear() {
    content.value = ''
    clearDraft()
  }

  return {
    content,
    clear,
  }
}
