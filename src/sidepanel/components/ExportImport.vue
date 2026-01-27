<script setup lang="ts">
import { ref } from 'vue'
import { Download, Upload } from 'lucide-vue-next'
import type { Memo } from '@/types'
import { getAllMemos, importMemos, validateMemoData } from '@/storage/engine'

const emit = defineEmits<{
  imported: [result: { imported: number; skipped: number; errors: number }]
  error: [message: string]
}>()

const isExporting = ref(false)
const isImporting = ref(false)
const fileInput = ref<HTMLInputElement>()

async function handleExport() {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const memos = await getAllMemos()
    const data = JSON.stringify(memos, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slidememos-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    emit('error', 'Export failed')
  } finally {
    isExporting.value = false
  }
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isImporting.value = true

  try {
    const text = await file.text()
    const data = JSON.parse(text) as unknown

    if (!validateMemoData(data)) {
      emit('error', 'Invalid file format')
      return
    }

    const result = await importMemos(data as Memo[], 'skip')
    emit('imported', result)
  } catch {
    emit('error', 'Import failed: invalid JSON')
  } finally {
    isImporting.value = false
    input.value = ''
  }
}
</script>

<template>
  <div class="export-import">
    <button
      class="action-btn"
      :disabled="isExporting"
      title="Export all memos to JSON"
      @click="handleExport"
    >
      <Download :size="16" />
    </button>
    <button
      class="action-btn"
      :disabled="isImporting"
      title="Import memos from JSON"
      @click="triggerImport"
    >
      <Upload :size="16" />
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<style scoped>
.export-import {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  transition:
    background 200ms ease-out,
    color 200ms ease-out;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hidden {
  display: none;
}
</style>
