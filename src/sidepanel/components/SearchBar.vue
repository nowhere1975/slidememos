<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from '@/utils'

const emit = defineEmits<{
  search: [query: string]
}>()

const query = ref('')
const inputRef = ref<HTMLInputElement>()

const debouncedSearch = debounce((value: string) => {
  emit('search', value)
}, 300)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  query.value = target.value
  debouncedSearch(target.value)
}

function handleClear() {
  query.value = ''
  emit('search', '')
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="search-bar">
    <input
      ref="inputRef"
      :value="query"
      type="text"
      placeholder="Search memos..."
      class="search-input"
      @input="handleInput"
      @keydown.escape="handleClear"
    />
    <button v-if="query" class="clear-btn" @click="handleClear">
      &times;
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding-right: 32px;
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 18px;
}

.clear-btn:hover {
  color: var(--color-text);
}
</style>
