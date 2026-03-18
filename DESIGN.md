# Design Document — 今天吃什么 (eat-what)

## 1. 产品定位

解决 **"今天吃什么"** 的终极难题。一个移动端优先的小工具：
- 随机抽签生成菜单
- 支持多菜系来源
- AI 自动规划采购清单 + 出餐时间线

目标用户：会做饭但不知道做什么的人。

## 2. 核心功能

### 2.1 菜单随机生成
- 用户选择 **菜单来源**（老饭骨 / 家常菜 / 川湘菜 / 粤菜 / 全部）
- 设置菜数 (1-10) 和汤数 (0-5)
- 点击「帮我做决定」随机抽签
- 第一道菜优先从「硬菜 + 快手肉菜」中选，后续从「快手肉菜 + 素菜 + 凉菜」中选
- 每道菜显示预估烹饪时间

### 2.2 锁定/重抽
- 对满意的菜点🔒锁定
- 再次点击「帮我做决定」只重抽未锁定的菜

### 2.3 AI 出餐规划
- 点击「AI帮我规划出餐」调用 Azure OpenAI
- 返回：采购清单（精确用量）+ 烹饪要点 + 1小时时间线

## 3. 数据模型

### 菜品 (Dish)
```
{
  name: string,      // 菜名（中文）
  time: number,      // 预估烹饪时间（分钟）
  source?: string    // 来源标记（运行时注入）
}
```

### 菜单来源 (MenuSource)
```
MENU_DB = {
  [sourceName: string]: {
    hard: Dish[],      // 硬菜
    fastMeat: Dish[],  // 快手肉菜
    veg: Dish[],       // 素菜
    cold: Dish[],      // 凉菜
    soup: Dish[]       // 汤
  }
}
```

## 4. 架构

```
┌─────────────────┐     POST /api/cooking-plan    ┌──────────────────┐
│   Static Web     │ ──────────────────────────▶  │  Azure Functions  │
│   (src/)         │ ◀──────────────────────────  │  (api/)           │
│                  │        { plan: html }         │                   │
│  index.html      │                               │  cooking-plan/    │
│  css/style.css   │                               │    index.js       │
│  js/app.js       │                               │                   │
│  js/menu-data.js │                               └───────┬──────────┘
└─────────────────┘                                        │
                                                           │ Azure OpenAI
                                                           ▼
                                                   ┌──────────────────┐
                                                   │  GPT Chat API     │
                                                   └──────────────────┘
```

## 5. 部署架构

**Azure Static Web Apps**:
- `src/` → CDN 全球分发的静态资源
- `api/` → 自动部署为 Azure Functions
- 通过 GitHub Actions CI/CD（push to main 自动部署）

环境变量通过 Azure Portal → Static Web Apps → Configuration 设置。

## 6. 未来扩展方向

- [ ] 菜品收藏 / 历史记录（localStorage 或后端持久化）
- [ ] 用户自定义菜单（增删菜品）
- [ ] 更多来源（东北菜、日料、西餐等）
- [ ] 食材库存管理（标记家里有什么，智能推荐）
- [ ] 分享菜单（生成图片/链接）
- [ ] PWA 离线支持
- [ ] 语音交互（"今天吃什么？"）
