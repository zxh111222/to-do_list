# GlassFlow Desktop 开发手册

## 1. 引言 (Introduction)

### 1.1 编写目的
本文档旨在为 **GlassFlow Desktop** (透明桌面效率套件) 提供全面的开发指导。它涵盖了系统架构、模块设计、数据结构、API 接口定义以及 UI/UX 规范，确保开发团队能够按照统一的标准构建高质量的桌面应用。

### 1.2 项目背景
本项目致力于打造一款无缝融入操作系统的桌面效率工具，通过透明窗口和嵌入式设计，解决传统效率软件“打开繁琐、遮挡视线”的痛点。核心理念是“存在即感知，无扰即高效”。

---

## 2. 系统架构 (System Architecture)

### 2.1 技术选型
*   **应用框架**: Electron (利用 Web 技术构建跨平台桌面应用)
*   **前端框架**: React + TypeScript (组件化开发，强类型保证)
*   **构建工具**: Vite (极速冷启动和热更新)
*   **样式库**: Tailwind CSS (原子化 CSS，便于实现高度定制的主题)
*   **状态管理**: Zustand (轻量级，支持持久化)
*   **本地数据库**: LowDB 或 SQLite (存储用户数据、配置)
*   **拖拽库**: dnd-kit (现代化的 React 拖拽解决方案)
*   **日期处理**: Day.js (轻量级日期库) + rrule (重复规则处理) + chrono-node (NLP 日期解析)

### 2.2 架构概览
应用采用标准的 Electron 双进程架构：
*   **Main Process (主进程)**: 负责窗口管理 (创建透明窗口)、系统级 API 调用 (托盘、开机自启)、数据持久化 IO 操作。
*   **Renderer Process (渲染进程)**: 负责 UI 渲染、用户交互、业务逻辑处理。
*   **IPC (进程间通信)**: 使用 `preload.js` 和 `ipcMain`/`ipcRenderer` 进行安全通信。

### 2.3 窗口管理策略 (Window Management)
由于应用包含多个功能模块（待办、日历、便签、天气），我们采用 **多窗口模型** 或 **单一大窗口+区域渲染**。考虑到性能和灵活性，推荐 **多窗口模型**：
*   **TodoWindow**: 待办清单窗口。
*   **CalendarWindow**: 日历窗口。
*   **NoteWindow**: 便签窗口（可能有多个）。
*   **WeatherWindow**: 天气窗口。

每个窗口需配置：
```javascript
new BrowserWindow({
  transparent: true, // 透明背景
  frame: false,      // 无边框
  hasShadow: false,  // 无阴影 (避免透明边缘有黑边)
  alwaysOnTop: false, // 可配置是否置顶
  type: 'toolbar',   // 在 Windows 上减少任务栏占用 (可选)
  skipTaskbar: true, // 不显示在任务栏
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
})
```
*注意：在 Windows 上实现完全“嵌入桌面”（在图标下方）较为复杂，通常采用 `type: 'desktop'` 或通过 Win32 API 将窗口父句柄设为 `Progman`。初期版本可仅实现“置底 (Bottom Most)”逻辑。*

---

## 3. 目录结构 (Directory Structure)

```
glassflow-desktop/
├── electron/                # Electron 主进程代码
│   ├── main/
│   │   ├── index.ts         # 入口文件
│   │   ├── windowManager.ts # 窗口管理逻辑
│   │   └── ipc.ts           # IPC 事件监听
│   └── preload/
│       └── index.ts         # 预加载脚本
├── src/                     # React 渲染进程代码
│   ├── components/          # 通用组件 (Button, Input, DragHandle)
│   ├── modules/             # 业务模块
│   │   ├── todo/            # 待办模块 (Views, Stores, Utils)
│   │   ├── calendar/        # 日历模块
│   │   ├── weather/         # 天气模块
│   │   └── notes/           # 便签模块
│   ├── styles/              # 全局样式
│   ├── utils/               # 工具函数 (Date, NLP)
│   ├── App.tsx              # 根组件
│   └── main.tsx             # 入口
├── resources/               # 静态资源 (Icons, Images)
├── types/                   # TypeScript 类型定义
├── package.json
└── vite.config.ts
```

---

## 4. 核心模块设计 (Core Module Design)

### 4.1 待办事项模块 (Todo Module)

#### 功能点
*   NLP 智能识别 ("明天下午3点开会" -> Date Object)
*   拖拽排序 & 置顶
*   多清单 (Lists) & 标签 (Tags)

#### 数据结构 (Interface)
```typescript
interface TodoItem {
  id: string;
  title: string;          // 原始文本
  content?: string;       // 备注
  dueDate?: number;       // 截止时间戳
  isCompleted: boolean;
  completedAt?: number;   // 完成时间
  isPinned: boolean;      // 是否置顶
  tags: string[];         // 标签ID列表
  listId: string;         // 所属清单ID
  order: number;          // 排序权重
}

interface TodoList {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
```

#### 关键逻辑
*   **智能识别**: 使用 `chrono-node` 库在输入框 `onChange` 或 `onBlur` 时解析文本，提取时间信息并高亮显示。
*   **日期倒数**: 计算 `dueDate - Date.now()`，格式化为 "2天后" 或 "今天"。

### 4.2 日历模块 (Calendar Module)

#### 功能点
*   多视图 (Month, Week, Day, Agenda)
*   农历 & 节假日
*   拖拽排程 (Todo -> Calendar)

#### 数据结构 (Interface)
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  startDate: number;
  endDate: number;
  isAllDay: boolean;
  rrule?: string;         // 重复规则 (iCal RRULE 字符串)
  type: 'event' | 'task'; // 事件类型
  refId?: string;         // 关联的 Todo ID (如果是 Task 类型)
  location?: string;
  alerts?: number[];      // 提醒设置 (分钟前)
}
```

#### 关键逻辑
*   **农历转换**: 使用 `lunar-javascript` 库获取农历、节气、节假日。
*   **重复规则**: 使用 `rrule` 库解析和生成重复事件的具体实例。
*   **拖拽交互**: 
    *   接收来自 Todo 列表的拖拽元素 (`useDroppable`)。
    *   计算拖拽释放点对应的日期/时间槽。
    *   创建新的 `CalendarEvent` 并更新 Todo 状态。

### 4.3 天气模块 (Weather Module)

#### 功能点
*   实时天气 & 7天预报
*   极端天气预警

#### 数据结构
```typescript
interface WeatherData {
  current: {
    temp: number;
    condition: string; // 'Sunny', 'Cloudy', etc.
    icon: string;
    humidity: number;
    windSpeed: number;
  };
  daily: Array<{
    date: number;
    minTemp: number;
    maxTemp: number;
    condition: string;
    icon: string;
  }>;
  alerts: Array<{
    title: string;
    description: string;
    level: 'yellow' | 'orange' | 'red';
  }>;
}
```

#### 关键逻辑
*   **API 策略**: 优先使用免费 API (如 OpenWeatherMap, 和风天气开发版)。
*   **缓存策略**: 避免频繁请求，每 30-60 分钟更新一次，缓存存储在 LocalStorage 或 LowDB。

### 4.4 个人设置 (Customization)

#### 配置项
```typescript
interface AppConfig {
  theme: {
    opacity: number;      // 透明度 (0.1 - 1.0)
    backgroundColor: string; // hex/rgba
    textColor: string;
    fontSize: number;     // base font size
    padding: number;      // 容器内边距
  };
  behavior: {
    startAtLogin: boolean;
    alwaysOnTop: boolean;
    clickThrough: boolean; // 是否鼠标穿透 (仅查看模式)
  };
}
```

---

## 5. UI/UX 设计规范 (UI/UX Guidelines)

### 5.1 透明度原则
*   **背景**: 默认提供磨砂玻璃效果 (`backdrop-filter: blur(10px)`) 以增强文字可读性，同时保持背景通透。
*   **文字**: 必须保证高对比度。提供“文字阴影”选项，确保在浅色壁纸上也能看清白色文字。

### 5.2 交互模式
*   **编辑模式**: 鼠标悬停或点击时，显示操作按钮 (完成、删除、拖拽手柄)。
*   **沉浸模式**: 鼠标移开后，隐藏所有辅助图标，只展示核心内容。

---

## 6. 开发流程 (Development Workflow)

1.  **环境准备**: 确保安装 Node.js (LTS)。
2.  **依赖安装**: `npm install`
3.  **启动开发**:
    *   `npm run dev`: 同时启动 Vite Server 和 Electron 主进程。
4.  **模块开发**:
    *   在 `src/modules` 下创建新模块。
    *   定义 Zustand Store。
    *   编写 UI 组件。
    *   集成 IPC 通信 (如果需要)。
5.  **构建与测试**:
    *   `npm run build`: 生成生产环境代码。
    *   `npm run preview`: 预览打包后的行为。

## 7. API 接口 (API Integration)

### 7.1 天气 API (示例)
*   **Provider**: 和风天气 (QWeather) / OpenWeatherMap
*   **Endpoint**: `GET /v7/weather/7d?location={lon},{lat}`
*   **Key Management**: API Key 不应硬编码在前端，建议通过主进程代理请求或用户自行填入。

### 7.2 系统 IPC 接口
*   `window:minimize`: 最小化窗口
*   `window:close`: 关闭窗口
*   `window:set-opacity`: 设置透明度
*   `window:set-ignore-mouse-events`: 设置鼠标穿透 (payload: boolean)
*   `app:get-path`: 获取用户数据路径

---

**注意**: 本文档为动态文档，随开发进度持续更新。
