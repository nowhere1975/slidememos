import { vi, beforeEach } from 'vitest'

// Extend globalThis for tests
declare global {
  // eslint-disable-next-line no-var
  var chrome: typeof chrome
  // eslint-disable-next-line no-var
  var fetch: typeof fetch
}

// Mock chrome extension APIs
globalThis.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      getBytesInUse: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    session: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
  },
} as unknown as typeof chrome

// Mock fetch for URL parser tests
globalThis.fetch = vi.fn()

// Mock console methods to keep test output clean
// But still allow errors to show
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  // Filter out expected errors in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('test expectation') || args[0].includes('[vitest]'))
  ) {
    return
  }
  originalConsoleError(...args)
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
