<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { t } from '@/utils/i18n'

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="about-overlay" @click.self="$emit('close')">
    <div class="about-page">
      <header class="about-header">
        <h2>{{ t('aboutTitle') }}</h2>
        <button class="close-btn" title="Close" @click="$emit('close')">
          <X :size="18" />
        </button>
      </header>

      <div class="about-content">
        <section class="section">
          <h3>{{ t('whatIs') }}</h3>
          <p>{{ t('whatIsDesc') }}</p>
        </section>

        <section class="section">
          <h3>{{ t('features') }}</h3>
          <ul class="feature-list">
            <li>
              <strong>{{ t('featureQuickCapture') }}</strong>
              <span>{{ t('featureQuickCaptureDesc') }}</span>
            </li>
            <li>
              <strong>{{ t('featureSmartDetection') }}</strong>
              <span>{{ t('featureSmartDetectionDesc') }}</span>
            </li>
            <li>
              <strong>{{ t('featureMarkdownPreview') }}</strong>
              <span>{{ t('featureMarkdownPreviewDesc') }}</span>
            </li>
            <li>
              <strong>{{ t('featureInstantSearch') }}</strong>
              <span>{{ t('featureInstantSearchDesc') }}</span>
            </li>
            <li>
              <strong>{{ t('featureCollapsible') }}</strong>
              <span>{{ t('featureCollapsibleDesc') }}</span>
            </li>
            <li>
              <strong>{{ t('featureDarkMode') }}</strong>
              <span>{{ t('featureDarkModeDesc') }}</span>
            </li>
          </ul>
        </section>

        <section class="section">
          <h3>{{ t('keyboardShortcuts') }}</h3>
          <ul class="shortcut-list">
            <li><kbd>Ctrl/Cmd + Enter</kbd> {{ t('shortcutSave') }}</li>
            <li><kbd>Ctrl/Cmd + F</kbd> {{ t('shortcutSearch') }}</li>
            <li><kbd>Esc</kbd> {{ t('shortcutCancel') }}</li>
          </ul>
        </section>

        <footer class="about-footer">
          <p class="version">{{ t('version') }} 0.4.0</p>
          <p class="copyright">{{ t('madeWith') }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.about-page {
  background: var(--color-bg);
  border-radius: var(--radius-lg, 12px);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.about-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.about-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  transition: background 200ms ease-out, color 200ms ease-out;
}

.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.about-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section:last-of-type {
  margin-bottom: 16px;
}

.section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
}

.section p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li strong {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.feature-list li span {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shortcut-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  font-family: inherit;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
}

.about-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.version {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.copyright {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.7;
}
</style>
