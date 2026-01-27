# Slidememos

A lightweight Chrome extension for quick note-taking directly from your browser sidebar.

[English](#features) | [中文](#功能特性)

## Features

- **Quick Capture** - Save notes instantly with `Ctrl/Cmd + Enter`
- **Smart Detection** - Auto-detects URLs, code blocks, and markdown content
- **Markdown Preview** - Write and preview markdown notes with a single click
- **Instant Search** - Find notes quickly with `Ctrl/Cmd + F`
- **Collapsible Cards** - Keep your workspace organized
- **Dark Mode** - Follows your system preference automatically
- **Multi-language** - Supports English and Chinese (auto-detected)
- **Offline First** - All data stored locally in your browser

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/nowhere1975/slidememos.git
cd slidememos
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. Click the Slidememos icon in your Chrome toolbar to open the sidebar
2. Type or paste content in the input area
3. Press `Ctrl/Cmd + Enter` or click "Save" to save your note
4. Click on any note to edit it
5. Use the search bar to find notes (`Ctrl/Cmd + F`)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Save note |
| `Ctrl/Cmd + F` | Focus search |
| `Esc` | Cancel editing |

## Development

```bash
# Start development server with HMR
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Vite
- Chrome Extension Manifest V3
- Lucide Icons
- DOMPurify + Marked (for markdown)

## License

[MIT](LICENSE)

---

# Slidememos

一款轻量级的 Chrome 扩展，用于在浏览器侧边栏中快速记录笔记。

## 功能特性

- **快速捕捉** - 使用 `Ctrl/Cmd + Enter` 即时保存笔记
- **智能识别** - 自动识别网址、代码块和 Markdown 内容
- **Markdown 预览** - 一键编写和预览 Markdown 笔记
- **即时搜索** - 使用 `Ctrl/Cmd + F` 快速查找笔记
- **可折叠卡片** - 保持工作区整洁有序
- **深色模式** - 自动跟随系统主题
- **多语言支持** - 支持中文和英文（自动检测）
- **离线优先** - 所有数据存储在本地浏览器中

## 安装方法

### 从源码安装

1. 克隆仓库：
```bash
git clone https://github.com/nowhere1975/slidememos.git
cd slidememos
```

2. 安装依赖：
```bash
npm install
```

3. 构建扩展：
```bash
npm run build
```

4. 在 Chrome 中加载：
   - 打开 `chrome://extensions/`
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `dist` 文件夹

## 使用方法

1. 点击 Chrome 工具栏中的 Slidememos 图标打开侧边栏
2. 在输入区域输入或粘贴内容
3. 按 `Ctrl/Cmd + Enter` 或点击「保存」按钮保存笔记
4. 点击任意笔记可进行编辑
5. 使用搜索栏查找笔记（`Ctrl/Cmd + F`）

### 快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl/Cmd + Enter` | 保存笔记 |
| `Ctrl/Cmd + F` | 聚焦搜索 |
| `Esc` | 取消编辑 |

## 开源协议

[MIT](LICENSE)
