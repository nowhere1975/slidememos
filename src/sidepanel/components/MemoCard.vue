<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from 'lucide-vue-next'
import type { Memo } from '@/types'
import { t } from '@/utils/i18n'
import { deleteMemo, updateMemo } from '@/storage/engine'
import { parseInput } from '@/parsers'
import { renderMarkdown } from '@/utils/sanitize'

const props = defineProps<{
  memo: Memo
  highlight?: string
  isNew?: boolean
  isCollapsed?: boolean
}>()

const emit = defineEmits<{
  delete: []
  updated: [memo: Memo]
  toggleCollapse: []
}>()

const isHighlighted = ref(false)
const isConfirmingDelete = ref(false)
const isPreviewing = ref(false)
const editingField = ref<'title' | 'content' | null>(null)
const editTitle = ref('')
const editContent = ref('')
const isSaving = ref(false)
const titleInputRef = ref<HTMLInputElement>()
const contentTextareaRef = ref<HTMLTextAreaElement>()
const cardRef = ref<HTMLElement>()

// Trigger highlight animation for new memos
onMounted(() => {
  if (props.isNew) {
    isHighlighted.value = true
    setTimeout(() => {
      isHighlighted.value = false
    }, 1000)
  }
  document.addEventListener('click', handleOutsideClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick, true)
})

function handleOutsideClick(e: MouseEvent) {
  if (editingField.value && cardRef.value && !cardRef.value.contains(e.target as Node)) {
    cancelEdit()
  }
  if (isConfirmingDelete.value && cardRef.value && !cardRef.value.contains(e.target as Node)) {
    isConfirmingDelete.value = false
  }
}

watch(
  () => props.isNew,
  (newVal) => {
    if (newVal) {
      isHighlighted.value = true
      setTimeout(() => {
        isHighlighted.value = false
      }, 1000)
    }
  }
)

const displayContent = computed(() => {
  // If previewing markdown, render it
  if (isPreviewing.value && isMarkdown.value) {
    return renderMarkdown(props.memo.content)
  }

  let content = props.memo.content
  if (content.length > 200) {
    content = content.slice(0, 200) + '...'
  }
  if (props.highlight) {
    const regex = new RegExp(`(${escapeRegex(props.highlight)})`, 'gi')
    content = content.replace(regex, '<mark>$1</mark>')
  }
  return content
})

const isMarkdown = computed(() => {
  return props.memo.metadata?.isMarkdown === true
})

const displayTitle = computed(() => {
  let title = props.memo.title
  if (props.highlight) {
    const regex = new RegExp(`(${escapeRegex(props.highlight)})`, 'gi')
    title = title.replace(regex, '<mark>$1</mark>')
  }
  return title
})

const formattedDate = computed(() => {
  return new Date(props.memo.updatedAt).toLocaleDateString()
})

const typeIcon = computed(() => {
  switch (props.memo.type) {
    case 'url':
      return '🔗'
    case 'code':
      return '💻'
    default:
      return '📝'
  }
})

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function startDelete(e: Event) {
  e.stopPropagation()
  isConfirmingDelete.value = true
}

function cancelDelete(e: Event) {
  e.stopPropagation()
  isConfirmingDelete.value = false
}

async function confirmDelete(e: Event) {
  e.stopPropagation()
  await deleteMemo(props.memo)
  emit('delete')
}

function toggleCollapse(e: Event) {
  e.stopPropagation()
  emit('toggleCollapse')
}

function togglePreview(e: Event) {
  e.stopPropagation()
  isPreviewing.value = !isPreviewing.value
}

function enterTitleEdit(e: Event) {
  e.stopPropagation()
  if (editingField.value === 'title') return
  editingField.value = 'title'
  editTitle.value = props.memo.title
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

function enterContentEdit(e: Event) {
  e.stopPropagation()
  if (editingField.value === 'content' || props.isCollapsed) return
  editingField.value = 'content'
  editContent.value = props.memo.content
  nextTick(() => {
    contentTextareaRef.value?.focus()
  })
}

function cancelEdit() {
  editingField.value = null
  editTitle.value = ''
  editContent.value = ''
}

async function saveTitle() {
  const trimmed = editTitle.value.trim()
  if (!trimmed || isSaving.value) return

  isSaving.value = true
  try {
    const updated = await updateMemo({
      ...props.memo,
      title: trimmed,
    })
    editingField.value = null
    emit('updated', updated)
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    isSaving.value = false
  }
}

async function saveContent() {
  const trimmed = editContent.value.trim()
  if (!trimmed || isSaving.value) return

  isSaving.value = true
  try {
    const parsed = await parseInput(trimmed)
    const updated = await updateMemo({
      ...props.memo,
      content: trimmed,
      title: parsed.title,
      type: parsed.type,
      metadata: parsed.metadata,
    })
    editingField.value = null
    emit('updated', updated)
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    isSaving.value = false
  }
}

function handleTitleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    cancelEdit()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    saveTitle()
  }
}

function handleContentKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    cancelEdit()
  } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    saveContent()
  }
}
</script>

<template>
  <article
    ref="cardRef"
    class="memo-card"
    :class="{ 'is-highlighted': isHighlighted, 'is-editing': editingField !== null, 'is-collapsed': isCollapsed }"
  >
    <header class="card-header">
      <span class="type-icon">{{ typeIcon }}</span>
      <!-- Title: View or Edit -->
      <h3
        v-if="editingField !== 'title'"
        class="card-title"
        v-html="displayTitle"
        @click="enterTitleEdit"
      ></h3>
      <input
        v-else
        ref="titleInputRef"
        v-model="editTitle"
        class="edit-title-input"
        @keydown="handleTitleKeydown"
        @click.stop
      />
      <!-- Markdown preview toggle -->
      <button
        v-if="isMarkdown"
        class="preview-btn"
        :class="{ 'is-active': isPreviewing }"
        :title="isPreviewing ? t('showSource') : t('preview')"
        @click="togglePreview"
      >
        <EyeOff v-if="isPreviewing" :size="14" />
        <Eye v-else :size="14" />
      </button>
    </header>

    <!-- Content: View or Edit (hidden when collapsed) -->
    <template v-if="!isCollapsed">
      <div
        v-if="editingField !== 'content'"
        class="card-content"
        :class="{ 'is-preview': isPreviewing && isMarkdown }"
        v-html="displayContent"
        @click="enterContentEdit"
      ></div>
      <textarea
        v-else
        ref="contentTextareaRef"
        v-model="editContent"
        class="edit-textarea"
        rows="3"
        @keydown="handleContentKeydown"
        @click.stop
      ></textarea>
    </template>

    <footer class="card-footer">
      <time class="card-date">{{ formattedDate }}</time>
      <!-- Edit actions when editing -->
      <div v-if="editingField" class="edit-actions" @click.stop>
        <button class="btn-cancel" @click="cancelEdit">{{ t('cancel') }}</button>
        <button
          class="btn-save"
          :disabled="isSaving || (editingField === 'title' ? !editTitle.trim() : !editContent.trim())"
          @click="editingField === 'title' ? saveTitle() : saveContent()"
        >
          {{ isSaving ? t('saving') + '...' : t('save') }}
        </button>
      </div>
      <!-- Delete confirmation -->
      <div v-else-if="isConfirmingDelete" class="delete-confirm" @click.stop>
        <span class="delete-confirm-text">{{ t('deleteConfirm') }}</span>
        <button class="btn-confirm-no" @click="cancelDelete">{{ t('no') }}</button>
        <button class="btn-confirm-yes" @click="confirmDelete">{{ t('yes') }}</button>
      </div>
      <!-- Normal actions -->
      <div v-else class="card-actions">
        <button
          class="collapse-btn"
          :title="isCollapsed ? t('expand') : t('collapse')"
          @click="toggleCollapse"
        >
          <ChevronDown v-if="isCollapsed" :size="14" />
          <ChevronUp v-else :size="14" />
        </button>
        <button class="delete-btn" :title="t('delete')" @click="startDelete">
          <Trash2 :size="14" />
        </button>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.memo-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius);
  padding: 12px;
  cursor: pointer;
  transition:
    transform 300ms ease-out,
    box-shadow 300ms ease-out,
    border-color 300ms ease-out;
  border: 2px solid transparent;
}

.memo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.memo-card.is-editing {
  cursor: default;
  transform: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.memo-card.is-collapsed {
  padding: 8px 12px;
}

.memo-card.is-collapsed .card-header {
  margin-bottom: 0;
}

.memo-card.is-collapsed .card-footer {
  margin-top: 8px;
}

/* New memo highlight animation */
.memo-card.is-highlighted {
  animation: highlight-pulse 1000ms ease-out;
  border-color: var(--color-primary);
}

@keyframes highlight-pulse {
  0% {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
  100% {
    border-color: transparent;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.type-icon {
  font-size: 16px;
  transition: transform 200ms ease-out;
}

.memo-card:hover .type-icon {
  transform: scale(1.1);
}

.card-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.card-title:hover {
  background: var(--color-bg);
}

.card-title :deep(mark) {
  background: var(--color-primary);
  color: white;
  padding: 0 2px;
  border-radius: 2px;
}

.edit-title-input {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  padding: 2px 4px;
  margin: -2px -4px;
  border: none;
  border-radius: 4px;
  background: transparent;
  outline: none;
}

.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--color-text-secondary);
  opacity: 0.3;
  transition: opacity 200ms ease-out, color 200ms ease-out;
}

.memo-card:hover .preview-btn {
  opacity: 0.5;
}

.preview-btn:hover {
  opacity: 0.8 !important;
}

.preview-btn.is-active {
  opacity: 0.8;
  color: var(--color-primary);
}

.card-content {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.card-content:hover {
  background: var(--color-bg);
}

.card-content :deep(mark) {
  background: var(--color-primary);
  color: white;
  padding: 0 2px;
  border-radius: 2px;
  transition: background 150ms linear;
}

/* Markdown preview styles */
.card-content.is-preview {
  cursor: default;
}

.card-content.is-preview:hover {
  background: transparent;
}

.card-content.is-preview :deep(h1),
.card-content.is-preview :deep(h2),
.card-content.is-preview :deep(h3),
.card-content.is-preview :deep(h4) {
  font-size: 14px;
  font-weight: 600;
  margin: 8px 0 4px;
  color: var(--color-text);
}

.card-content.is-preview :deep(h1):first-child,
.card-content.is-preview :deep(h2):first-child,
.card-content.is-preview :deep(h3):first-child {
  margin-top: 0;
}

.card-content.is-preview :deep(p) {
  margin: 4px 0;
}

.card-content.is-preview :deep(ul),
.card-content.is-preview :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;
}

.card-content.is-preview :deep(li) {
  margin: 2px 0;
}

.card-content.is-preview :deep(code) {
  background: var(--color-bg);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.card-content.is-preview :deep(pre) {
  background: var(--color-bg);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
}

.card-content.is-preview :deep(pre code) {
  background: transparent;
  padding: 0;
}

.card-content.is-preview :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  margin: 8px 0;
  padding-left: 12px;
  color: var(--color-text-secondary);
}

.card-content.is-preview :deep(a) {
  color: var(--color-primary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.card-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.card-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  padding: 4px 8px;
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.memo-card:hover .collapse-btn {
  opacity: 0.6;
}

.collapse-btn:hover {
  opacity: 1 !important;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  padding: 4px;
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.memo-card:hover .delete-btn {
  opacity: 0.4;
}

.delete-btn:hover {
  opacity: 0.8;
}

/* Delete confirmation */
.delete-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-confirm-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.btn-confirm-no,
.btn-confirm-yes {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-confirm-no {
  color: var(--color-text-secondary);
}

.btn-confirm-no:hover {
  background: var(--color-bg);
}

.btn-confirm-yes {
  color: var(--color-danger);
}

.btn-confirm-yes:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Edit mode styles */
.edit-textarea {
  width: 100%;
  min-height: 60px;
  resize: none;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  padding: 4px;
  margin: -4px;
  border: none;
  border-radius: 4px;
  background: transparent;
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-save {
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  transition: opacity 150ms ease-out;
}

.btn-cancel {
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  opacity: 0.7;
}

.btn-save {
  color: var(--color-primary);
  font-weight: 500;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.7;
}

.btn-save:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Dark mode shadow adjustment */
@media (prefers-color-scheme: dark) {
  .memo-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>
