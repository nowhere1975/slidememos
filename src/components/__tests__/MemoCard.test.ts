import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Mock components for testing
const MemoCard = {
  name: 'MemoCard',
  props: {
    memo: {
      type: Object,
      required: true
    },
    isCollapsed: Boolean
  },
  emits: ['edit', 'delete', 'toggle'],
  template: `
    <div data-testid="memo-card" :data-collapsed="isCollapsed">
      <h3 data-testid="memo-title">{{ memo.title }}</h3>
      <p data-testid="memo-content">{{ memo.content }}</p>
      <button data-testid="edit-btn" @click="$emit('edit')">Edit</button>
      <button data-testid="delete-btn" @click="$emit('delete')">Delete</button>
      <button data-testid="toggle-btn" @click="$emit('toggle')">Toggle</button>
    </div>
  `
}

describe('MemoCard Component', () => {
  const mockMemo = {
    id: 'test-123',
    title: 'Test Memo',
    content: 'This is test content',
    type: 'text' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  it('should render memo title and content', () => {
    const wrapper = mount(MemoCard, {
      props: {
        memo: mockMemo,
        isCollapsed: false
      }
    })

    expect(wrapper.find('[data-testid="memo-title"]').text()).toBe('Test Memo')
    expect(wrapper.find('[data-testid="memo-content"]').text()).toBe('This is test content')
  })

  it('should emit edit event when edit button clicked', async () => {
    const wrapper = mount(MemoCard, {
      props: {
        memo: mockMemo,
        isCollapsed: false
      }
    })

    await wrapper.find('[data-testid="edit-btn"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('should emit delete event when delete button clicked', async () => {
    const wrapper = mount(MemoCard, {
      props: {
        memo: mockMemo,
        isCollapsed: false
      }
    })

    await wrapper.find('[data-testid="delete-btn"]').trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('should emit toggle event when toggle button clicked', async () => {
    const wrapper = mount(MemoCard, {
      props: {
        memo: mockMemo,
        isCollapsed: false
      }
    })

    await wrapper.find('[data-testid="toggle-btn"]').trigger('click')

    expect(wrapper.emitted('toggle')).toBeTruthy()
  })

  it('should reflect collapsed state', () => {
    const wrapper = mount(MemoCard, {
      props: {
        memo: mockMemo,
        isCollapsed: true
      }
    })

    expect(wrapper.find('[data-testid="memo-card"]').attributes('data-collapsed')).toBe('true')
  })

  it('should handle URL type memo with metadata', () => {
    const urlMemo = {
      ...mockMemo,
      type: 'url' as const,
      metadata: {
        url: 'https://example.com',
        title: 'Example Site',
        favicon: 'https://example.com/favicon.ico'
      }
    }

    const wrapper = mount(MemoCard, {
      props: {
        memo: urlMemo,
        isCollapsed: false
      }
    })

    expect(wrapper.find('[data-testid="memo-card"]').exists()).toBe(true)
  })
})

// SearchBar component tests
describe('SearchBar Component', () => {
  const SearchBar = {
    name: 'SearchBar',
    props: {
      modelValue: String
    },
    emits: ['update:modelValue', 'search', 'clear'],
    template: `
      <div data-testid="search-bar">
        <input
          data-testid="search-input"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          @keyup.enter="$emit('search')"
          placeholder="Search memos..."
        />
        <button
          v-if="modelValue"
          data-testid="clear-btn"
          @click="$emit('clear')"
        >Clear</button>
      </div>
    `
  }

  it('should render search input', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      }
    })

    expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-input"]').attributes('placeholder')).toBe('Search memos...')
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('[data-testid="search-input"]')
    await input.setValue('test query')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test query'])
  })

  it('should emit search on enter key', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test query'
      }
    })

    await wrapper.find('[data-testid="search-input"]').trigger('keyup.enter')

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('should show clear button when has value', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test'
      }
    })

    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(true)
  })

  it('should hide clear button when empty', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      }
    })

    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(false)
  })

  it('should emit clear on clear button click', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test'
      }
    })

    await wrapper.find('[data-testid="clear-btn"]').trigger('click')

    expect(wrapper.emitted('clear')).toBeTruthy()
  })
})
