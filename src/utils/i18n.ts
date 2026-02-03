/** Simple i18n utility for Slidememos */

type Locale = 'zh' | 'en'

interface Translations {
  // App
  appTitle: string
  loading: string

  // Editor
  editorPlaceholder: string
  save: string
  saving: string
  cancel: string

  // Memo Card
  expand: string
  collapse: string
  delete: string
  deleteConfirm: string
  yes: string
  no: string
  showSource: string
  preview: string
  copy: string
  cut: string

  // Toast
  memoSaved: string
  memoUpdated: string
  memoDeleted: string

  // About Page
  aboutTitle: string
  whatIs: string
  whatIsDesc: string
  features: string
  featureQuickCapture: string
  featureQuickCaptureDesc: string
  featureSmartDetection: string
  featureSmartDetectionDesc: string
  featureMarkdownPreview: string
  featureMarkdownPreviewDesc: string
  featureInstantSearch: string
  featureInstantSearchDesc: string
  featureCollapsible: string
  featureCollapsibleDesc: string
  featureDarkMode: string
  featureDarkModeDesc: string
  keyboardShortcuts: string
  shortcutSave: string
  shortcutSearch: string
  shortcutCancel: string
  version: string
  madeWith: string
}

const zh: Translations = {
  // App
  appTitle: 'Slidememos',
  loading: '加载中...',

  // Editor
  editorPlaceholder: '写笔记、粘贴网址或代码...',
  save: '保存',
  saving: '保存中',
  cancel: '取消',

  // Memo Card
  expand: '展开',
  collapse: '折叠',
  delete: '删除',
  deleteConfirm: '确认删除？',
  yes: '是',
  no: '否',
  showSource: '显示源码',
  preview: '预览',
  copy: '复制',
  cut: '剪切',

  // Toast
  memoSaved: '已保存',
  memoUpdated: '已更新',
  memoDeleted: '已删除',

  // About Page
  aboutTitle: '关于 Slidememos',
  whatIs: '什么是 Slidememos？',
  whatIsDesc: 'Slidememos 是一款轻量级的 Chrome 扩展，用于快速记录笔记。可以直接在浏览器侧边栏中捕捉想法、网址、代码片段和 Markdown 笔记。',
  features: '功能特性',
  featureQuickCapture: '快速捕捉',
  featureQuickCaptureDesc: '使用 Ctrl/Cmd + Enter 即时保存笔记',
  featureSmartDetection: '智能识别',
  featureSmartDetectionDesc: '自动识别网址、代码块和 Markdown',
  featureMarkdownPreview: 'Markdown 预览',
  featureMarkdownPreviewDesc: '编写并预览 Markdown 笔记',
  featureInstantSearch: '即时搜索',
  featureInstantSearchDesc: '使用 Ctrl/Cmd + F 快速查找笔记',
  featureCollapsible: '可折叠卡片',
  featureCollapsibleDesc: '保持工作区整洁有序',
  featureDarkMode: '深色模式',
  featureDarkModeDesc: '跟随系统主题自动切换',
  keyboardShortcuts: '快捷键',
  shortcutSave: '保存笔记',
  shortcutSearch: '聚焦搜索',
  shortcutCancel: '取消编辑',
  version: '版本',
  madeWith: '为效率而生',
}

const en: Translations = {
  // App
  appTitle: 'Slidememos',
  loading: 'Loading...',

  // Editor
  editorPlaceholder: 'Write a note, paste a URL, or code...',
  save: 'Save',
  saving: 'Saving',
  cancel: 'Cancel',

  // Memo Card
  expand: 'Expand',
  collapse: 'Collapse',
  delete: 'Delete',
  deleteConfirm: 'Delete?',
  yes: 'Yes',
  no: 'No',
  showSource: 'Show source',
  preview: 'Preview',
  copy: 'Copy',
  cut: 'Cut',

  // Toast
  memoSaved: 'Memo saved',
  memoUpdated: 'Memo updated',
  memoDeleted: 'Memo deleted',

  // About Page
  aboutTitle: 'About Slidememos',
  whatIs: 'What is Slidememos?',
  whatIsDesc: 'Slidememos is a lightweight Chrome extension for quick note-taking. Capture ideas, URLs, code snippets, and markdown notes directly from your browser sidebar.',
  features: 'Features',
  featureQuickCapture: 'Quick Capture',
  featureQuickCaptureDesc: 'Save notes instantly with Ctrl/Cmd + Enter',
  featureSmartDetection: 'Smart Detection',
  featureSmartDetectionDesc: 'Auto-detects URLs, code blocks, and markdown',
  featureMarkdownPreview: 'Markdown Preview',
  featureMarkdownPreviewDesc: 'Write and preview markdown notes',
  featureInstantSearch: 'Instant Search',
  featureInstantSearchDesc: 'Find notes quickly with Ctrl/Cmd + F',
  featureCollapsible: 'Collapsible Cards',
  featureCollapsibleDesc: 'Keep your workspace organized',
  featureDarkMode: 'Dark Mode',
  featureDarkModeDesc: 'Follows your system preference',
  keyboardShortcuts: 'Keyboard Shortcuts',
  shortcutSave: 'Save note',
  shortcutSearch: 'Focus search',
  shortcutCancel: 'Cancel editing',
  version: 'Version',
  madeWith: 'Made with care for productivity',
}

const translations: Record<Locale, Translations> = { zh, en }

/** Detect if browser language is Chinese */
function detectLocale(): Locale {
  const lang = navigator.language.toLowerCase()
  return lang.startsWith('zh') ? 'zh' : 'en'
}

const currentLocale = detectLocale()

/** Get translation for a key */
export function t<K extends keyof Translations>(key: K): string {
  return translations[currentLocale][key]
}

/** Get current locale */
export function getLocale(): Locale {
  return currentLocale
}
