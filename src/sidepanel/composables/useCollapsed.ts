import { ref } from 'vue'
import { getCollapsedIds, saveCollapsedIds } from '@/storage/engine'

const collapsedIds = ref<Set<string>>(new Set())

// Initialize immediately when module loads
getCollapsedIds().then((ids) => {
  collapsedIds.value = new Set(ids)
})

export function useCollapsed() {
  function isCollapsed(id: string): boolean {
    return collapsedIds.value.has(id)
  }

  async function toggleCollapsed(id: string): Promise<void> {
    const newSet = new Set(collapsedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    collapsedIds.value = newSet
    // Save to session storage
    await saveCollapsedIds([...newSet])
  }

  return {
    collapsedIds,
    isCollapsed,
    toggleCollapsed,
  }
}
