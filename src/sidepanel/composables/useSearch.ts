import { ref, computed } from 'vue'

const query = ref('')

export function useSearch() {
  function setQuery(value: string) {
    query.value = value
  }

  function clearQuery() {
    query.value = ''
  }

  return {
    query: computed(() => query.value),
    setQuery,
    clearQuery,
  }
}
