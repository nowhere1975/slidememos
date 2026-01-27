# CLAUDE.md - Slidememos Engineering Guidelines

## 🛠 开发环境 (Environment)
* **Runtime**: Node.js v18+
* **Framework**: Vue 3 (Composition API) + Vite
* **Extension API**: Manifest V3
* **Style**: CSS Variables (推荐，适配 Dark Mode)
* **Browser**: Chrome 116+ / Edge 116+

## 📦 核心依赖 (Dependencies)

| 包名 | 用途 | 版本要求 |
|------|------|----------|
| `nanoid` | Memo ID 生成 (12位) | ^5.0 |
| `dompurify` | XSS 过滤 | ^3.0 |
| `marked` | Markdown 渲染 | ^12.0 |
| `idb` | IndexedDB Promise 封装 | ^8.0 |
| `@vueuse/core` | 常用 Composables | ^10.0 |

**禁止引入**:
- 重型 UI 框架 (Element Plus, Vuetify, Ant Design 等)
- 需要 `eval()` 或动态代码执行的库
- 体积 > 50KB 的单一依赖（需评审）

## 🤖 常用指令 (Commands)
* **启动开发**: `npm run dev` (监听文件变动并 HMR)
* **生产构建**: `npm run build` (输出至 `dist/`)
* **类型检查**: `npm run type-check` (基于 `vue-tsc`)
* **代码检查**: `npm run lint` (ESLint)
* **代码格式化**: `npm run format` (Prettier)

## 🏗 项目架构 (Architecture)

```text
src/
├── background/              # Service Workers
│   └── index.ts             # 安装事件, Side Panel 配置
├── sidepanel/               # 侧边栏主应用
│   ├── components/          # UI 组件 (原子设计原则)
│   │   ├── MemoCard.vue     # 单条笔记卡片
│   │   ├── MemoList.vue     # 虚拟滚动列表
│   │   ├── MemoEditor.vue   # 编辑器组件
│   │   ├── SearchBar.vue    # 搜索框
│   │   └── Toast.vue        # 全局提示
│   ├── composables/         # 逻辑复用
│   │   ├── useMemos.ts      # Memo CRUD 操作
│   │   ├── useSearch.ts     # 搜索逻辑
│   │   ├── useDraft.ts      # 草稿管理 (L1)
│   │   └── useToast.ts      # Toast 控制
│   └── App.vue
├── parsers/                 # [核心] 技能层 - 独立的解析逻辑
│   ├── index.ts             # 解析器入口 (自动识别类型)
│   ├── url-parser.ts        # 网页元数据提取
│   ├── text-parser.ts       # 文本/Markdown 处理
│   └── code-parser.ts       # 代码语言检测
├── storage/                 # [核心] 存储层 - 分级存储引擎
│   ├── engine.ts            # 统一存储入口
│   ├── sync.ts              # L2 chrome.storage.sync
│   ├── local.ts             # L3 chrome.storage.local
│   ├── session.ts           # L1 chrome.storage.session
│   └── indexeddb.ts         # L4 IndexedDB 搜索缓存
├── types/                   # 统一类型定义
│   ├── memo.ts              # Memo 接口
│   └── storage.ts           # 存储相关类型
└── utils/                   # 通用工具
    ├── sanitize.ts          # DOMPurify 封装
    └── debounce.ts          # 防抖工具
```

## 📜 编码规约 (Coding Standards)

### 1. 技能化开发 (Skill-Based Development)

所有"内容处理"逻辑必须封装在 `src/parsers/` 下，作为独立的 Skill。

* **原则**: Parser 必须是纯函数，不依赖 Vue 上下文
* **输入输出明确**: 接收原始数据，返回结构化结果
* **示例**:
```typescript
// url-parser.ts
export async function parseURL(url: string): Promise<MemoMetadata> {
  // P1/P2/P3 降级逻辑
}
```

### 2. 存储层规范 (Storage Layer)

**禁止**: 在 UI 组件中直接调用 `chrome.storage.*`
**必须**: 通过 `useMemos` Composable 进行数据操作

**写入流程**:
1. 检查 `chrome.storage.sync.getBytesInUse()`
2. 若已用 < 75% 且单条 < 8KB → 写入 L2 (Sync)
3. 否则 → 写入 L3 (Local)，标记 `_local_only: true`
4. 同步写入 L4 (IndexedDB) 用于搜索索引

**读取流程**:
1. 优先从 L4 (IndexedDB) 读取（性能最优）
2. L4 不可用时降级到 L2 + L3 合并读取

**草稿处理 (L1)**:
- 输入时实时写入 Session Storage (防抖 500ms)
- 保存成功后清除草稿
- Side Panel 关闭前检查草稿，提示用户保存或丢弃

### 3. 安全优先 (Security First)

* **HTML 渲染**: 严禁使用 `v-html` 渲染未过滤内容，必须使用 `DOMPurify.sanitize()`
* **CSP 兼容**: 禁止 `eval()`、`new Function()`、内联脚本
* **用户输入**: 所有外部输入（粘贴内容、URL）必须经过校验

### 4. 组件开发规范 (Component Standards)

**命名规范**:
- 组件文件: PascalCase (`MemoCard.vue`)
- Composable 文件: camelCase (`useMemos.ts`)
- 类型文件: kebab-case (`memo.ts`)

**Props/Emits**:
- 必须使用 TypeScript 定义类型
- 禁止使用 `any`，必要时使用 `unknown` + 类型守卫

**样式规范**:
- 使用 `<style scoped>` 避免样式污染
- 颜色使用 CSS Variables 支持 Dark Mode:
  ```css
  :root { --color-bg: #ffffff; --color-text: #1a1a1a; }
  @media (prefers-color-scheme: dark) {
    :root { --color-bg: #1a1a1a; --color-text: #ffffff; }
  }
  ```
- 动效时长统一 `300ms`，缓动函数 `ease-out`

### 5. Git 提交规范

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add url fallback parser` |
| `fix` | 修复 Bug | `fix: sync storage overflow` |
| `refactor` | 代码重构 | `refactor: extract storage engine` |
| `perf` | 性能优化 | `perf: virtual scroll for memo list` |
| `test` | 测试相关 | `test: add parser unit tests` |
| `chore` | 构建/工具 | `chore: update vite config` |
| `docs` | 文档修改 | `docs: update README` |

## ⚡ 性能规范 (Performance)

| 指标 | 目标 | 实现要点 |
|------|------|----------|
| 冷启动 | < 200ms | 禁止 `onMounted` 中同步阻塞操作 |
| 搜索响应 | < 100ms | 使用 IndexedDB 索引，非全量遍历 |
| 列表渲染 | > 30fps | 虚拟滚动，单次渲染 DOM < 20 个 |
| 输入防抖 | 300ms | 搜索框输入 |
| 存储防抖 | 500ms | 草稿自动保存 |

## 🚦 提交前检查清单 (Pre-commit Checklist)

1. [ ] **Type Check**: `npm run type-check` 无报错
2. [ ] **Lint**: `npm run lint` 无警告
3. [ ] **Build**: `npm run build` 构建成功
4. [ ] **Manifest**: 版本号已更新，权限最小化
5. [ ] **Security**: 无 `v-html` 直接渲染用户内容
