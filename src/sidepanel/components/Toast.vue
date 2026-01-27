<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  message: string
  type?: 'info' | 'error' | 'success'
}>()

const isVisible = computed(() => props.message.length > 0)
const toastType = computed(() => props.type || 'info')
</script>

<template>
  <Transition name="toast">
    <div v-if="isVisible" class="toast" :class="'toast--' + toastType">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: var(--radius);
  font-size: 13px;
  z-index: 1000;
}

.toast--error {
  background: var(--color-danger);
  color: white;
}

.toast--success {
  background: var(--color-success);
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 300ms ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
