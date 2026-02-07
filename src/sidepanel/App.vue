<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Info } from 'lucide-vue-next'
import type { Memo } from '@/types'
import { t } from '@/utils/i18n'
import SearchBar from './components/SearchBar.vue'
import MemoList from './components/MemoList.vue'
import MemoEditor from './components/MemoEditor.vue'
import AboutPage from './components/AboutPage.vue'
import Toast from './components/Toast.vue'
import { useMemos, useSearch, useToast } from './composables'

const { memos, isLoading, newMemoId, loadMemos, addMemo, updateMemo, removeMemo } =
  useMemos()
const { query: searchQuery, setQuery: handleSearch } = useSearch()
const { message: toastMessage, type: toastType, showToast, showSuccess } = useToast()

const searchBarRef = ref<InstanceType<typeof SearchBar>>()
const showAbout = ref(false)

onMounted(async () => {
  await loadMemos()

  // Load demo data if empty
  if (memos.value.length === 0) {
    const demoMemos: Memo[] = [
      {
        id: 'demo-001',
        title: '项目API配置',
        content: 'Base URL: https://api.example.com/v1\nAPI Key: sk_live_51Hx9...\nTimeout: 30s',
        type: 'text',
        metadata: {},
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 2
      },
      {
        id: 'demo-002',
        title: 'Vue.js - 渐进式 JavaScript 框架',
        content: 'https://vuejs.org/',
        type: 'url',
        metadata: {
          url: 'https://vuejs.org/',
          favicon: 'https://vuejs.org/logo.svg'
        },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2
      },
      {
        id: 'demo-003',
        title: '今日待办',
        content: '## 工作任务\n\n- [ ] 完成项目文档\n- [x] 代码审查\n- [ ] 发布更新',
        type: 'text',
        metadata: { isMarkdown: true },
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000
      },
      {
        id: 'demo-004',
        title: 'GitHub',
        content: 'https://github.com/',
        type: 'url',
        metadata: {
          url: 'https://github.com/',
          favicon: 'https://github.com/favicon.ico'
        },
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000
      },
      {
        id: 'demo-005',
        title: '灵感记录',
        content: '侧边栏笔记的核心价值：不跳出当前页面，随时记录碎片信息。',
        type: 'text',
        metadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]
    for (const memo of demoMemos) {
      await addMemo(memo)
    }
    // Set collapsed state for demo
    await chrome.storage.session.set({
      collapsed_memos: ['demo-002', 'demo-004']
    })
  }

  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
    event.preventDefault()
    searchBarRef.value?.focus()
  }
}

function handleMemoCreated(memo: Memo) {
  addMemo(memo)
  showSuccess(t('memoSaved'))
}

function handleMemoUpdated(memo: Memo) {
  updateMemo(memo)
  showSuccess(t('memoUpdated'))
}

function handleMemoDeleted(id: string) {
  removeMemo(id)
  showToast(t('memoDeleted'))
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <h1 class="title">Slidememos</h1>
        <button class="about-btn" title="About" @click="showAbout = true">
          <Info :size="18" />
        </button>
      </div>
      <SearchBar ref="searchBarRef" @search="handleSearch" />
    </header>

    <MemoEditor @created="handleMemoCreated" @updated="handleMemoUpdated" @error="showToast" />

    <main class="main">
      <Transition name="fade" mode="out-in">
        <div v-if="isLoading" class="loading">
          <span class="loading-spinner"></span>
          <span>{{ t('loading') }}</span>
        </div>
        <MemoList
          v-else
          :memos="memos"
          :search-query="searchQuery"
          :new-memo-id="newMemoId"
          @delete="handleMemoDeleted"
          @updated="handleMemoUpdated"
        />
      </Transition>
    </main>

    <Toast :message="toastMessage" :type="toastType" />

    <!-- About Page Modal -->
    <Transition name="fade">
      <AboutPage v-if="showAbout" @close="showAbout = false" />
    </Transition>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  gap: 16px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.about-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  transition: background 200ms ease-out, color 200ms ease-out;
}

.about-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.main {
  flex: 1;
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
