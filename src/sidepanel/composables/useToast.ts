import { ref } from 'vue'

type ToastType = 'info' | 'error' | 'success'

const message = ref('')
const type = ref<ToastType>('info')
let timeoutId: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg: string, toastType: ToastType = 'info', duration = 2000) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    message.value = msg
    type.value = toastType
    timeoutId = setTimeout(() => {
      message.value = ''
      timeoutId = null
    }, duration)
  }

  function showError(msg: string, duration = 3000) {
    showToast(msg, 'error', duration)
  }

  function showSuccess(msg: string, duration = 2000) {
    showToast(msg, 'success', duration)
  }

  return {
    message,
    type,
    showToast,
    showError,
    showSuccess,
  }
}
