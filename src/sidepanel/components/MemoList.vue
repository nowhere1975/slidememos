<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVirtualList } from '@vueuse/core'
import type { Memo } from '@/types'
import MemoCard from './MemoCard.vue'
import { useCollapsed } from '../composables'

const props = defineProps<{
  memos: Memo[]
  searchQuery: string
  newMemoId?: string
}>()

const emit = defineEmits<{
  delete: [id: string]
  updated: [memo: Memo]
}>()

const { isCollapsed, toggleCollapsed } = useCollapsed()

const isScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const filteredMemos = computed(() => {
  if (!props.searchQuery) {
    return props.memos
  }
  const query = props.searchQuery.toLowerCase()
  return props.memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(query) ||
      memo.content.toLowerCase().includes(query)
  )
})

// Use virtual list for performance with large datasets
const { list, containerProps, wrapperProps } = useVirtualList(filteredMemos, {
  itemHeight: 120, // Estimated height per card
  overscan: 5, // Render extra items above/below viewport
})

function handleScroll() {
  isScrolling.value = true
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false
  }, 1000)
}
</script>

<template>
  <div class="memo-list">
    <Transition name="fade" mode="out-in">
      <div v-if="filteredMemos.length === 0" class="empty">
        <p v-if="searchQuery">No memos found for "{{ searchQuery }}"</p>
        <p v-else>No memos yet. Create your first one!</p>
      </div>
      <div
        v-else
        v-bind="containerProps"
        class="list-container"
        :class="{ 'is-scrolling': isScrolling }"
        @scroll="handleScroll"
      >
        <div v-bind="wrapperProps" class="list">
          <MemoCard
            v-for="{ data: memo, index } in list"
            :key="memo.id"
            :memo="memo"
            :highlight="searchQuery"
            :is-new="memo.id === newMemoId"
            :is-collapsed="isCollapsed(memo.id)"
            :style="{ marginBottom: index < list.length - 1 ? '12px' : '0' }"
            @delete="emit('delete', memo.id)"
            @updated="emit('updated', $event)"
            @toggle-collapse="toggleCollapsed(memo.id)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.memo-list {
  height: 100%;
  overflow: hidden;
}

.list-container {
  height: 100%;
  overflow-y: auto;
}

.list {
  display: flex;
  flex-direction: column;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
  text-align: center;
}

/* Fade transition for empty state */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
