# Slidememos - 产品需求文档 (PRD)

**版本**: v0.4.0-mvp
**日期**: 2026-01-27
**状态**: 开发就绪 (Ready for Dev)
**定位**: 浏览器侧边栏智能笔记 (MVP)

## 1. 产品核心 (Core Value)
**Slidememos** 是一个驻留在浏览器侧边栏的轻量级笔记工具，旨在解决"碎片化信息收集难"的问题。它利用浏览器原生能力，实现"零跳转"记录和"被动式"同步。

## 2. 关键技术策略 (Technical Strategy)
针对浏览器插件环境的特殊性，采取以下核心策略：

### 2.1 存储分级策略 (Tiered Storage)
* **L1 (Hot)**: `chrome.storage.session` + `setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })`
    * 用于暂存未保存的草稿，**仅在 Side Panel 打开期间有效**
    * Side Panel 关闭时，若有未保存草稿，自动提示用户保存或丢弃
* **L2 (Sync)**: `chrome.storage.sync` (100KB) - 仅存储核心文本数据，实现跨设备同步。
* **L3 (Cold)**: `chrome.storage.local` (5MB+) - 当 Sync 已用空间 > **75%** 或单次写入会导致超限时，自动溢出存储至本地，并标记 `_local_only`。
* **L4 (Cache)**: `IndexedDB` - 全量数据镜像，用于高性能搜索和列表渲染。

### 2.2 URL 解析降级策略 (Parser Fallback)
* **P1 (Active Tab)**: 若保存当前激活页面，直接读取 DOM 的 `og:tags` 和 `favicon`（100% 成功率，无 CORS 问题）。
* **P2 (Fetch)**: 若粘贴外部 URL，尝试 `fetch()` 获取 HTML。
* **P3 (Fallback)**: 若 Fetch 失败（CORS/防火墙），仅解析 URL 域名生成标题，显示默认图标。

## 3. 核心功能清单 (MVP Scope)

### F1. 沉浸式侧边栏 (Side Panel)
* **交互**: 点击插件图标直接唤起 Side Panel（需配置 `openPanelOnActionClick`）。
* **布局**: 单列流式卡片，支持 `Virtual Scrolling` (虚拟滚动) 以应对长列表性能问题。
* **动效**: 卡片 CRUD 操作需具备 300ms 以内的 `Transition` 动效。

### F2. 智能内容处理 (Smart Parsing)
* **自动标题**:
    * 普通文本：截取首行前 15 字符。
    * URL：解析网页 Title。
    * 代码片段：检测语言类型，生成如 `📝 JavaScript 片段` 的标题。
* **Markdown 渲染**: 支持基础语法（Bold, List, Link, Code），**强制**使用 `DOMPurify` 过滤 XSS。

### F3. 数据安全与导出
* **隐私模式**: 所有数据仅存储在用户浏览器及 Google 账号内，不上传第三方服务器。
* **灾备导出**: 提供 "Export to JSON" 按钮，允许用户全量备份数据（P0 级功能，防止存储溢出导致数据锁死）。
* **数据导入**: 支持从 JSON 文件恢复数据，导入前校验数据格式。

### F4. 本地搜索 (Local Search)
* **入口**: 侧边栏顶部搜索框，支持快捷键 `Ctrl/Cmd + F` 聚焦。
* **范围**: 搜索 Memo 的标题和内容，基于 IndexedDB 全文检索。
* **性能**: 搜索响应时间 < 100ms（1000 条数据规模）。
* **交互**:
    * 实时搜索，输入防抖 300ms
    * 搜索结果高亮匹配关键词
    * 空搜索框时显示全部列表

### F5. 一键保存当前页 (Quick Save)
* **触发**: Side Panel 顶部 "+" 按钮 或 键盘快捷键（可配置，默认 `Alt + S`）。
* **行为**: 自动提取当前 Tab 的 Title + URL + og:description，生成一条 Memo。
* **反馈**: 保存成功后卡片高亮闪烁 + 滚动到新卡片位置。
* **去重**: 若已存在相同 URL 的 Memo，提示用户"已存在，是否更新？"

## 4. 数据结构 (Data Schema)

```typescript
interface Memo {
  id: string;              // nanoid 生成，12位
  content: string;         // 原始内容（Markdown 或纯文本）
  title: string;           // 自动生成或用户编辑
  type: 'text' | 'url' | 'code';
  metadata?: {
    url?: string;          // 原始 URL
    favicon?: string;      // base64 或 URL
    ogDescription?: string;// Open Graph 描述
    language?: string;     // 代码语言类型
  };
  createdAt: number;       // Unix timestamp (ms)
  updatedAt: number;       // Unix timestamp (ms)
  _local_only?: boolean;   // 标记仅本地存储（Sync 溢出）
}

// 存储键值结构
interface StorageSchema {
  memos: Memo[];           // L2/L3 存储
  settings: UserSettings;  // 用户配置
  draft?: Memo;            // L1 草稿暂存
}
```

## 5. 扩展权限清单 (Required Permissions)

| 权限 | 用途 | 必要性 |
|------|------|--------|
| `sidePanel` | 启用侧边栏功能 | 必须 |
| `activeTab` | 读取当前页面 DOM 获取 og:tags/favicon | 必须 |
| `storage` | 使用 sync/local/session 存储 | 必须 |
| `scripting` | 在当前页面执行脚本提取元数据 | 必须 |

**注意**:
- 不申请 `<all_urls>` 或宽泛的 `host_permissions`，避免触发 Chrome 商店严格审核。
- `contextMenus` 权限留待 MVP 后版本添加右键菜单功能。

## 6. 异常场景处理 (Error Handling)

| 场景 | 用户反馈 | 技术处理 |
|------|----------|----------|
| URL 解析失败 (P3 降级) | Toast: "无法获取网页信息，已保存链接" | 使用域名作为标题，显示默认 favicon |
| Sync 存储写入失败 | Toast: "同步失败，已保存到本地" | 自动降级到 L3，标记 `_local_only` |
| Sync 空间不足 | Toast: "云端空间已满，新笔记将保存在本地" | 后续写入直接走 L3 |
| IndexedDB 不可用 | 静默降级，搜索入口置灰 | 列表直接从 L2/L3 读取 |
| 内容过长 (>8KB 单条) | 输入时显示字数统计，超限时警告 | 前端限制 + 提示拆分 |
| 导入数据格式错误 | Toast: "文件格式不正确，请检查" | 校验 JSON schema，拒绝导入 |
| 网络离线 | 状态栏显示离线图标 | 所有操作走本地，恢复后不自动同步 |

## 7. 成功指标 (Success Metrics)

### 性能指标
* Side Panel 冷启动时间 < **200ms**
* 搜索响应时间 < **100ms**（1000 条数据）
* 卡片渲染帧率 > **30fps**（虚拟滚动场景）

### 稳定性指标
* URL 解析成功率（含降级）保持 **100%** 不报错
* Sync 满载时 Local Fallback 触发正确率 **100%**
* 数据导出/导入完整性 **100%**

### 兼容性指标
* 支持 Chrome **116+**（MV3 稳定版基线）
* 支持 Edge **116+**（Chromium 内核）

### 可用性指标
* 首次安装后无需任何配置即可使用
* 核心操作（新建/搜索/导出）点击次数 ≤ **2次**
