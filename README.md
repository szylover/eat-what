# 🍳 吃什么 - AI菜单生成器

随机生成今日菜单，AI帮你规划做法、采购清单和出餐时间线。

## 📅 这周吃什么 Agent

网页新增「这周吃什么」标签页。它会从已保存的家庭画像带入人数、口味、时间、厨具、采购习惯和每晚结构，只补问本周库存或临时变化，最后生成：

- 每天一荤、一素、一半荤、一汤的晚餐安排与不同辣度的分流建议
- 合并采购清单、统一预处理和保存提示
- 可复用晚餐的两分钟早餐
- 可下载的 Markdown 计划，以及浏览器“另存为 PDF”的 A4 打印版

草稿、明确保存的长期偏好和相同输入的计划结果存储在浏览器 `localStorage` 中；不会上传或提交个人库存。服务端会返回模型可用的 KV 缓存命中统计。点击「重新做一周」会保留已明确保存的长期偏好，但会清空本周库存和计划。

## 口味画像与菜单归档

`/api/taste-profile` 为随机菜单与周计划提供同一份口味规则：在家主力菜、餐厅收藏、周末复杂菜和排除食材会被分别处理。每周生成的菜单及 PDF 归档在 `plans/YYYY-Www/`；当前下载链接仍指向 `downloads/weekly-meal-plan-printable.pdf`。

## 运行方法

```bash
npm install
npm start
```

打开 http://localhost:3000

## 配置

运行前需要在项目根目录创建 `.env` 文件：

```
AZURE_OPENAI_API_KEY=你的key
AZURE_OPENAI_ENDPOINT=https://你的资源.openai.azure.com/openai/deployments/模型名/chat/completions?api-version=2025-01-01-preview
PORT=3000
```
