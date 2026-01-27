<script setup lang="ts">
import { ref } from 'vue'
import type { Memo } from '@/types'
import { saveMemo, findMemoByUrl, updateMemo } from '@/storage/engine'
import { parseInput } from '@/parsers'
import { t } from '@/utils/i18n'
import { useDraft } from '../composables'

const emit = defineEmits<{
  created: [memo: Memo]
  updated: [memo: Memo]
  error: [message: string]
}>()

const { content, clear: clearDraftContent } = useDraft()
const isSubmitting = ref(false)
const isFocused = ref(false)
const saveSuccess = ref(false)
const duplicateUrl = ref<{ url: string; existingMemo: Memo } | null>(null)

async function handleSubmit() {
  const trimmed = content.value.trim()
  if (!trimmed || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const parsed = await parseInput(trimmed)

    // Check for duplicate URL
    if (parsed.type === 'url' && parsed.metadata?.url) {
      const existing = await findMemoByUrl(parsed.metadata.url)
      if (existing) {
        duplicateUrl.value = { url: parsed.metadata.url, existingMemo: existing }
        isSubmitting.value = false
        return
      }
    }

    const memo = await saveMemo({
      content: trimmed,
      title: parsed.title,
      type: parsed.type,
      metadata: parsed.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    clearDraftContent()
    triggerSuccessAnimation()
    emit('created', memo)
  } catch (error) {
    console.error('Save failed:', error)
    emit('error', 'Save failed')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDuplicateAction(action: 'update' | 'cancel') {
  if (!duplicateUrl.value) return

  if (action === 'update') {
    isSubmitting.value = true
    try {
      const parsed = await parseInput(content.value.trim())
      const updated = await updateMemo({
        ...duplicateUrl.value.existingMemo,
        content: content.value.trim(),
        title: parsed.title,
        metadata: parsed.metadata,
        updatedAt: Date.now(),
      })
      clearDraftContent()
      triggerSuccessAnimation()
      emit('updated', updated)
    } catch (error) {
      console.error('Update failed:', error)
      emit('error', 'Update failed')
    } finally {
      isSubmitting.value = false
    }
  }

  duplicateUrl.value = null
}

function triggerSuccessAnimation() {
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 600)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    handleSubmit()
  }
}
</script>

<template>
  <div class="memo-editor" :class="{ 'is-focused': isFocused, 'save-success': saveSuccess }">
    <textarea
      v-model="content"
      :placeholder="t('editorPlaceholder')"
      class="editor-input"
      rows="3"
      @keydown="handleKeydown"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></textarea>

    <!-- Duplicate URL warning -->
    <div v-if="duplicateUrl" class="duplicate-warning">
      <p>This URL already exists. Update the existing memo?</p>
      <div class="duplicate-actions">
        <button class="btn-cancel" @click="handleDuplicateAction('cancel')">{{ t('cancel') }}</button>
        <button class="btn-update" @click="handleDuplicateAction('update')">Update</button>
      </div>
    </div>

    <div v-else class="editor-actions">
      <button
        class="submit-btn"
        :class="{ 'is-loading': isSubmitting }"
        :disabled="!content.trim() || isSubmitting"
        :title="t('shortcutSave')"
        @click="handleSubmit"
      >
        <span v-if="isSubmitting" class="btn-spinner"></span>
        <span>{{ isSubmitting ? t('saving') : t('save') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.memo-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius);
  border: 2px solid transparent;
  transition:
    border-color 300ms ease-out,
    box-shadow 300ms ease-out;
}

.memo-editor.is-focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.memo-editor.save-success {
  animation: success-flash 600ms ease-out;
}

@keyframes success-flash {
  0% {
    border-color: var(--color-success);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
  100% {
    border-color: transparent;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.editor-input {
  resize: none;
  min-height: 80px;
  border: none;
  background: transparent;
  padding: 0;
  transition: min-height 200ms ease-out;
}

.editor-input:focus {
  outline: none;
  min-height: 100px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  min-width: 80px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius);
  transition:
    background 200ms ease-out,
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.duplicate-warning {
  padding: 8px 12px;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius);
}

.duplicate-warning p {
  font-size: 13px;
  color: var(--color-text);
  margin-bottom: 8px;
}

.duplicate-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel,
.btn-update {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: var(--radius);
  transition: background 200ms ease-out;
}

.btn-cancel {
  color: var(--color-text-secondary);
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-update {
  background: var(--color-primary);
  color: white;
}

.btn-update:hover {
  background: var(--color-primary-hover);
}
</style>
