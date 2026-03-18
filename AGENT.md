# Agent Instructions — 今天吃什么 (eat-what)

## Project Overview

这是一个中文菜单随机生成器 + AI 出餐规划工具，部署在 **Azure Static Web Apps** 上。
用户选择菜单来源和数量，系统随机抽签并调用 Azure OpenAI 生成采购清单与时间规划。

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML + CSS + ES Modules (no framework) |
| API | Azure Functions (Node.js, CommonJS) |
| AI | Azure OpenAI (GPT chat completions) |
| Hosting | Azure Static Web Apps |

## Project Structure

```
eat-what/
├── src/                    # 前端静态文件 (SWA app_location)
│   ├── index.html          # 入口页面（纯结构，无内联脚本/样式）
│   ├── css/
│   │   └── style.css       # 全部样式
│   └── js/
│       ├── app.js          # 主逻辑（ES Module）
│       └── menu-data.js    # 菜单数据（ES Module, default export MENU_DB）
├── api/                    # Azure Functions (SWA api_location)
│   ├── host.json           # Functions runtime config
│   ├── package.json        # API dependencies
│   ├── local.settings.json # 本地开发环境变量（不提交 git）
│   └── cooking-plan/       # POST /api/cooking-plan
│       ├── function.json   # Trigger binding
│       └── index.js        # Handler (CommonJS)
├── staticwebapp.config.json # SWA routing config
├── package.json            # Root package (dev tooling)
├── AGENT.md                # ← 你在看的这个文件
└── DESIGN.md               # 产品设计文档
```

## Development

```bash
# 安装依赖
npm install

# 本地开发（需要先配置 api/local.settings.json）
npm run dev
# 打开 http://localhost:4280
```

SWA CLI 会同时启动前端 (port 4280) 和 API (port 7071)。

## Key Conventions

### Frontend
- **纯 Vanilla JS**，不用任何框架和构建工具。
- JS 使用 **ES Modules** (`import/export`)，在 HTML 中用 `<script type="module">` 加载。
- 样式全部在 `src/css/style.css`，不使用内联 style。
- DOM 操作集中在 `app.js`，数据在 `menu-data.js`。

### API (Azure Functions)
- 使用 **CommonJS** (`module.exports`)，Node.js >=18。
- 函数入口格式：`module.exports = async function (context, req) { ... }`
- 通过 `process.env` 读取 secrets，不要硬编码。
- Azure OpenAI 的 endpoint 和 key 配置在 SWA Application Settings 或 `local.settings.json` 中。

### Menu Data (`menu-data.js`)
- `MENU_DB` 对象，key 是来源名（老饭骨 / 家常菜 / 川湘菜 / 粤菜 / 日料 / 韩餐 / 西餐 / 东南亚），value 按分类：
  - `hard` — 硬菜（耗时较长）
  - `fastMeat` — 快手肉菜
  - `veg` — 素菜
  - `cold` — 凉菜
  - `soup` — 汤
- 每道菜格式：`{ name: string, time: number }`，`time` 单位是分钟。
- 菜单来源支持 **多选**（checkbox chip 样式），前端合并所选来源的菜品。
- 新增来源时同步更新 `index.html` 的 checkbox 和 `style.css` 的 `.source-{name}` + `.source-chip[data-source="{name}"].checked` 颜色。

## Common Tasks

### 添加新菜单来源
1. 在 `src/js/menu-data.js` 的 `MENU_DB` 中添加新 key（如 `"东北菜"`）
2. 在 `src/index.html` 的 `#menuSources` div 中添加 `<label class="source-chip" data-source="东北菜"><input type="checkbox" value="东北菜">🥟 东北菜</label>`
3. 在 `src/css/style.css` 中添加:
   - `.source-东北菜 { background: #xxx; }`
   - `.source-chip[data-source="东北菜"].checked { background: #xxx; border-color: #xxx; }`

### 添加新菜品
直接在 `src/js/menu-data.js` 对应来源和分类的数组中追加 `{ name: "菜名", time: 分钟数 }`。

### 修改 AI Prompt
编辑 `api/cooking-plan/index.js` 中的 `prompt` 变量。

### 添加新 API 端点
1. 在 `api/` 下创建新文件夹（如 `api/new-endpoint/`）
2. 添加 `function.json`（定义 trigger）和 `index.js`（handler）

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI 完整 URL（含 deployment 和 api-version） |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API Key |

## Deployment

通过 GitHub Actions 自动部署到 Azure Static Web Apps：
- `app_location`: `src`
- `api_location`: `api`
- `output_location`: `src`（无构建步骤）
