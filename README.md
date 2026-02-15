# GlassFlow Desktop (透明桌面效率套件)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)

**GlassFlow Desktop** 是一款美观、实用且高度可定制的透明桌面效率工具。它无缝融入您的桌面环境，提供待办事项管理、日历规划、专注计时、便签记录和天气信息展示，助您在不干扰工作流的情况下保持井井有条。

![App Preview](docs/preview.png)

## ✨ 核心功能

### 1. 📝 透明桌面待办清单 (Todo List)
*   **沉浸式体验**：全透明背景，嵌入桌面，开机即见。
*   **日期倒数**：直观显示任务截止日期的倒数天数。
*   **智能识别**：支持自然语言输入（例如：“明天下午3点开会”），自动识别日期和时间。
*   **灵活排序**：支持鼠标拖拽快速排序，一键置顶重要事项。
*   **数据备份**：支持本地数据导出与导入，确保数据安全。

### 2. 📅 透明桌面日历 (Calendar)
*   **多视图切换**：支持月视图、周视图、日程列表视图。
*   **日程详情**：点击日程可查看详细信息（时间、来源等）。
*   **万年历集成**：显示农历、节假日信息。
*   **拖拽规划**：直接将待办事项拖入日历生成日程。

### 3. ⏳ 专注计时器 (Focus Timer)
*   **环形进度**：精美的可视化环形倒计时。
*   **番茄工作法**：内置专注（25分钟）与休息（5分钟）模式，一键切换。
*   **沉浸体验**：与桌面融为一体，时刻提醒当前状态。

### 4. 🌤️ 桌面天气时钟 (Weather & Time)
*   **实时天气**：基于 Open-Meteo API，支持城市定位。
*   **全面信息**：显示时间、日期、星期、农历、实时温度、风速湿度。
*   **未来预报**：直观的未来几天天气趋势。

### 5. 🎨 极致个性化 & 系统集成
*   **外观定制**：自由调节透明度，支持界面缩放。
*   **系统托盘**：最小化到托盘，随时右键呼出或退出。
*   **布局调整**：可折叠侧边栏，自定义模块布局比例。

## 🛠️ 技术栈 (Tech Stack)

本项目采用现代化的桌面应用开发技术栈：

*   **Core**: [Electron](https://www.electronjs.org/) (跨平台桌面应用框架)
*   **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (快速UI构建)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (轻量级状态管理)
*   **Animation**: [Framer Motion](https://www.framer.com/motion/) (流畅的交互动画)
*   **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## 🚀 快速开始 (Getting Started)

### 环境要求
*   Node.js >= 16.0.0
*   npm or yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/zxh111222/to-do_list.git

# 进入目录
cd to-do_list

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建 Windows 应用
npm run build
```

## 📄 开发文档

详细的架构设计、模块说明及API接口文档请参阅 [开发手册](./docs/DEVELOPMENT_MANUAL.md)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License
