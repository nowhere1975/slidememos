/** Simple performance measurement utilities */

export function measureTime<T>(fn: () => T, label: string): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  if (import.meta.env.DEV) {
    console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`)
  }
  return result
}

export async function measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  if (import.meta.env.DEV) {
    console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`)
  }
  return result
}
